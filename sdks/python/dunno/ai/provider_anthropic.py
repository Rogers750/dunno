"""Dunno-wrapped Anthropic client. Requires: pip install dunno[anthropic]"""
from __future__ import annotations

import time
from typing import Any, Optional

try:
    from anthropic import Anthropic as _BaseAnthropic
    from anthropic.types import Message as AnthropicMessage
except ImportError as e:
    raise ImportError("Install dunno[anthropic]: pip install dunno[anthropic]") from e

from dunno.client import DunnoClient
from dunno.models import EventProperties

_DEFAULT_CLIENT: Optional[DunnoClient] = None


def _get_default_client() -> DunnoClient:
    global _DEFAULT_CLIENT
    if _DEFAULT_CLIENT is None:
        _DEFAULT_CLIENT = DunnoClient()
    return _DEFAULT_CLIENT


class _WrappedMessages:
    def __init__(self, base: Any, dunno: DunnoClient) -> None:
        self._base = base
        self._dunno = dunno

    def create(
        self,
        *,
        dunno_agent: Optional[str] = None,
        dunno_session: Optional[str] = None,
        dunno_person: Optional[str] = None,
        dunno_agent_version: Optional[str] = None,
        **kwargs: Any,
    ) -> AnthropicMessage:
        start = time.monotonic()
        result = self._base.create(**kwargs)
        latency_ms = int((time.monotonic() - start) * 1000)

        if dunno_session:
            usage = getattr(result, "usage", None)
            messages = kwargs.get("messages", [])
            system = kwargs.get("system")
            if system:
                messages = [{"role": "system", "content": system}] + messages

            props = EventProperties(
                model=result.model,
                input_tokens=getattr(usage, "input_tokens", None),
                output_tokens=getattr(usage, "output_tokens", None),
                latency_ms=latency_ms,
                messages=messages,
            )
            self._dunno.events.create(
                event_name="llm",
                properties=props,
                session=dunno_session,
                agent=dunno_agent,
                agent_version=dunno_agent_version,
                person=dunno_person,
            )

        return result


class Anthropic(_BaseAnthropic):
    """Drop-in Anthropic client that automatically tracks events via Dunno."""

    def __init__(self, *args: Any, dunno_client: Optional[DunnoClient] = None, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        _dunno = dunno_client or _get_default_client()
        self.messages = _WrappedMessages(super().messages, _dunno)  # type: ignore[assignment]
