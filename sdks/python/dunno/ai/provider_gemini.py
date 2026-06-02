"""Dunno-wrapped Google Gemini client. Requires: pip install dunno[google]"""
from __future__ import annotations

import time
from typing import Any, Optional

try:
    import google.generativeai as genai
    from google.generativeai import GenerativeModel as _BaseGenerativeModel
except ImportError as e:
    raise ImportError("Install dunno[google]: pip install dunno[google]") from e

from dunno.client import DunnoClient
from dunno.models import EventProperties

_DEFAULT_CLIENT: Optional[DunnoClient] = None


def _get_default_client() -> DunnoClient:
    global _DEFAULT_CLIENT
    if _DEFAULT_CLIENT is None:
        _DEFAULT_CLIENT = DunnoClient()
    return _DEFAULT_CLIENT


class GenerativeModel(_BaseGenerativeModel):
    """Drop-in Gemini GenerativeModel that automatically tracks events via Dunno."""

    def __init__(
        self,
        *args: Any,
        dunno_client: Optional[DunnoClient] = None,
        dunno_agent: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        super().__init__(*args, **kwargs)
        self._dunno = dunno_client or _get_default_client()
        self._dunno_agent = dunno_agent

    def generate_content(
        self,
        contents: Any,
        *,
        dunno_session: Optional[str] = None,
        dunno_person: Optional[str] = None,
        dunno_agent_version: Optional[str] = None,
        **kwargs: Any,
    ) -> Any:
        start = time.monotonic()
        result = super().generate_content(contents, **kwargs)
        latency_ms = int((time.monotonic() - start) * 1000)

        if dunno_session:
            usage = getattr(result, "usage_metadata", None)
            messages = [{"role": "user", "content": str(contents)}]

            props = EventProperties(
                model=self.model_name,
                input_tokens=getattr(usage, "prompt_token_count", None),
                output_tokens=getattr(usage, "candidates_token_count", None),
                latency_ms=latency_ms,
                messages=messages,
            )
            self._dunno.events.create(
                event_name="llm",
                properties=props,
                session=dunno_session,
                agent=self._dunno_agent,
                agent_version=dunno_agent_version,
                person=dunno_person,
            )

        return result
