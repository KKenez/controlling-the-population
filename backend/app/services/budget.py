import json
import logging

from app.services.ai.client import get_llm_client
from app.schemas.budget import ParsedExpenseItem

logger = logging.getLogger(__name__)


async def parse_spending_text(
    text: str,
    date: str,
    input_currency: str,
    huf_eur_rate: float,
    categories: list,
) -> list[ParsedExpenseItem]:
    """Use LLM to parse free-text spending description into categorized items."""

    cat_list = ", ".join(f'"{c.name}"' for c in categories)

    prompt = f"""You are a personal finance assistant. Parse the user's spending description into individual expense items.

AVAILABLE CATEGORIES: [{cat_list}]

INPUT CURRENCY: {input_currency}
{"HUF to EUR rate: " + str(huf_eur_rate) + " (divide HUF amounts by this to get EUR)" if input_currency == "HUF" else ""}
DATE: {date}

USER'S SPENDING TODAY:
{text}

INSTRUCTIONS:
- Extract each expense as a separate item
- Assign the best matching category from the list above
- Convert all amounts to EUR{" (divide by " + str(huf_eur_rate) + ")" if input_currency == "HUF" else ""}
- Keep descriptions short and clear
- If amount is ambiguous, make your best guess

Respond with ONLY a JSON array, no other text:
[
  {{"amount": 11.35, "category": "Groceries", "description": "Spar weekly shop", "original": "spar 4200"}}
]
"""

    client = get_llm_client()
    response = await client.generate(prompt)

    # Parse JSON from response
    try:
        # Try to find JSON array in the response
        response = response.strip()
        if response.startswith("```"):
            # Strip markdown code fence
            lines = response.split("\n")
            response = "\n".join(lines[1:-1] if lines[-1].startswith("```") else lines[1:])

        start = response.find("[")
        end = response.rfind("]") + 1
        if start == -1 or end == 0:
            logger.error("No JSON array found in AI response: %s", response)
            return []

        parsed = json.loads(response[start:end])
    except json.JSONDecodeError as e:
        logger.error("Failed to parse AI response as JSON: %s\nResponse: %s", e, response)
        return []

    items = []
    for raw in parsed:
        amount = float(raw.get("amount", 0))
        if amount <= 0:
            continue
        items.append(ParsedExpenseItem(
            amount=round(amount, 2),
            category_name=raw.get("category", "Other"),
            description=raw.get("description", ""),
            original_text=raw.get("original", ""),
        ))

    return items
