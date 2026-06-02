from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Optional


@dataclass
class Agent:
    agent_name: str
    description: Optional[str]
    agent_number: Optional[int]
    created_at: datetime
    deprecated_at: Optional[datetime]


@dataclass
class AgentVersion:
    agent_version_name: str
    description: Optional[str]
    agent_version_number: Optional[int]
    created_at: datetime
    deprecated_at: Optional[datetime]


@dataclass
class Person:
    person_id: str
    properties: dict[str, Any]
    created_at: datetime


@dataclass
class Fingerprint:
    fingerprint_id: str
    language: str
    language_version: Optional[str]
    sdk_version: Optional[str]
    system: str
    created_at: datetime


@dataclass
class EventProperties:
    model: Optional[str] = None
    input_tokens: Optional[int] = None
    output_tokens: Optional[int] = None
    latency_ms: Optional[int] = None
    messages: Optional[list[dict]] = None
    tool_calls: Optional[list[dict]] = None
    extra: Optional[dict[str, Any]] = None

    def to_dict(self) -> dict:
        d = {}
        if self.model is not None:
            d["model"] = self.model
        if self.input_tokens is not None:
            d["input_tokens"] = self.input_tokens
        if self.output_tokens is not None:
            d["output_tokens"] = self.output_tokens
        if self.latency_ms is not None:
            d["latency_ms"] = self.latency_ms
        if self.messages is not None:
            d["messages"] = self.messages
        if self.tool_calls is not None:
            d["tool_calls"] = self.tool_calls
        if self.extra:
            d["extra"] = self.extra
        return d
