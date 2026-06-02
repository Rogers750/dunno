"""Dunno-wrapped OpenAI client. Requires: pip install dunno[openai]"""
from __future__ import annotations

import time
from typing import Any, Optional

try:
    import openai as _openai
    from openai import OpenAI as _BaseOpenAI
    from openai.types.chat import ChatCompletion
except ImportError as e:
    raise ImportError("Install dunno[openai]: pip install dunno[openai]") from e

from dunno.client import DunnoClient
from dunno.models import EventProperties

_DEFAULT_CLIENT: Optional[DunnoClient] = None


def _get_default_client() -> DunnoClient:
    global _DEFAULT_CLIENT
    if _DEFAULT_CLIENT is None:
        _DEFAULT_CLIENT = DunnoClient()
    return _DEFAULT_CLIENT


class _WrappedCompletions:
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
    ) -> ChatCompletion:
        start = time.monotonic()
        result = self._base.create(**kwargs)
        latency_ms = int((time.monotonic() - start) * 1000)

        if dunno_session:
            usage = getattr(result, "usage", None)
            props = EventProperties(
                model=result.model,
                input_tokens=getattr(usage, "prompt_tokens", None),
                output_tokens=getattr(usage, "completion_tokens", None),
                latency_ms=latency_ms,
                messages=kwargs.get("messages"),
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


class _WrappedChat:
    def __init__(self, base: Any, dunno: DunnoClient) -> None:
        self.completions = _WrappedCompletions(base.completions, dunno)


class OpenAI(_BaseOpenAI):
    """Drop-in OpenAI client that automatically tracks events via Dunno."""

    def __init__(self, *args: Any, dunno_client: Optional[DunnoClient] = None, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        _dunno = dunno_client or _get_default_client()
        self.chat = _WrappedChat(super().chat, _dunno)  # type: ignore[assignment]
