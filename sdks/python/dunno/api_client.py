"""Synchronous direct API client — for fetching/creating resources."""
from __future__ import annotations

import os
import platform
import sys
from typing import Any, Optional

import httpx

from .models import Agent, AgentVersion, EventProperties, Fingerprint, Person

_DEFAULT_BASE_URL = "http://localhost:8000"


class ApiClient_Agents:
    def __init__(self, http: httpx.Client) -> None:
        self._http = http

    def create(self, agent_name: str, description: Optional[str] = None) -> Agent:
        r = self._http.put("/api/v1/agents", json={"agent_name": agent_name, "description": description})
        r.raise_for_status()
        d = r.json()
        return Agent(**{k: d[k] for k in Agent.__dataclass_fields__})

    def get(self, agent_name: str) -> Agent:
        r = self._http.get(f"/api/v1/agents/{agent_name}")
        r.raise_for_status()
        d = r.json()
        return Agent(**{k: d[k] for k in Agent.__dataclass_fields__})


class ApiClient_AgentVersions:
    def __init__(self, http: httpx.Client) -> None:
        self._http = http

    def create(self, agent_name: str, agent_version_name: str, description: Optional[str] = None) -> AgentVersion:
        r = self._http.put(
            f"/api/v1/agents/{agent_name}/agent-versions",
            json={"agent_version_name": agent_version_name, "description": description},
        )
        r.raise_for_status()
        d = r.json()
        return AgentVersion(**{k: d[k] for k in AgentVersion.__dataclass_fields__})

    def get(self, agent_name: str, agent_version_name: str) -> AgentVersion:
        r = self._http.get(f"/api/v1/agents/{agent_name}/agent-versions/{agent_version_name}")
        r.raise_for_status()
        d = r.json()
        return AgentVersion(**{k: d[k] for k in AgentVersion.__dataclass_fields__})


class ApiClient_People:
    def __init__(self, http: httpx.Client) -> None:
        self._http = http

    def create(self, person_id: str, properties: Optional[dict[str, Any]] = None) -> Person:
        r = self._http.put("/api/v1/people", json={"person_id": person_id, "properties": properties or {}})
        r.raise_for_status()
        d = r.json()
        return Person(**{k: d[k] for k in Person.__dataclass_fields__})

    def get(self, person_id: str) -> Person:
        r = self._http.get(f"/api/v1/people/{person_id}")
        r.raise_for_status()
        d = r.json()
        return Person(**{k: d[k] for k in Person.__dataclass_fields__})

    def update(self, person_id: str, properties: dict[str, Any]) -> Person:
        r = self._http.put(f"/api/v1/people/{person_id}", json={"properties": properties})
        r.raise_for_status()
        d = r.json()
        return Person(**{k: d[k] for k in Person.__dataclass_fields__})


class ApiClient_Fingerprints:
    def __init__(self, http: httpx.Client) -> None:
        self._http = http

    def create(self) -> Fingerprint:
        payload = {
            "language": "python",
            "language_version": sys.version,
            "sdk_version": "0.1.0",
            "system": platform.system() + " " + platform.release(),
        }
        r = self._http.put("/api/v1/fingerprints", json=payload)
        r.raise_for_status()
        d = r.json()
        return Fingerprint(**{k: d[k] for k in Fingerprint.__dataclass_fields__})


class ApiClient_Events:
    def __init__(self, http: httpx.Client) -> None:
        self._http = http

    def create(
        self,
        event_name: str,
        properties: EventProperties,
        session: str,
        fingerprint_id: str,
        agent: Optional[str] = None,
        agent_version: Optional[str] = None,
        person: Optional[str] = None,
    ) -> None:
        payload: dict[str, Any] = {
            "event_name": event_name,
            "properties": properties.to_dict(),
            "session": session,
            "fingerprint_id": fingerprint_id,
        }
        if agent:
            payload["agent"] = agent
        if agent_version:
            payload["agent_version"] = agent_version
        if person:
            payload["person"] = person
        r = self._http.post("/api/v1/events", json=payload)
        r.raise_for_status()


class ApiClient:
    """Direct synchronous API client."""

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None) -> None:
        api_key = api_key or os.environ.get("DUNNO_API_KEY", "")
        base_url = base_url or os.environ.get("DUNNO_BASE_URL", _DEFAULT_BASE_URL)

        self._http = httpx.Client(
            base_url=base_url,
            headers={"X-API-Key": api_key},
            timeout=10.0,
        )
        self.agents = ApiClient_Agents(self._http)
        self.agent_versions = ApiClient_AgentVersions(self._http)
        self.people = ApiClient_People(self._http)
        self.fingerprints = ApiClient_Fingerprints(self._http)
        self.events = ApiClient_Events(self._http)

    def close(self) -> None:
        self._http.close()

    def __enter__(self) -> "ApiClient":
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()
