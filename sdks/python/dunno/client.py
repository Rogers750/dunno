"""Async background DunnoClient — fire-and-forget event sending."""
from __future__ import annotations

import os
import queue
import threading
from typing import Any, Optional

import httpx

from .models import EventProperties

_DEFAULT_BASE_URL = "http://localhost:8000"


class DunnoClient_Events:
    def __init__(self, client: "DunnoClient") -> None:
        self._client = client

    def create(
        self,
        event_name: str,
        properties: EventProperties,
        session: str,
        agent: Optional[str] = None,
        agent_version: Optional[str] = None,
        person: Optional[str] = None,
    ) -> None:
        """Queue an event for async transmission. Non-blocking."""
        self._client._enqueue({
            "type": "event",
            "payload": {
                "event_name": event_name,
                "properties": properties.to_dict(),
                "session": session,
                "agent": agent,
                "agent_version": agent_version,
                "person": person,
            },
        })


class DunnoClient_People:
    def __init__(self, client: "DunnoClient") -> None:
        self._client = client

    def create(self, person_id: str, properties: Optional[dict[str, Any]] = None) -> None:
        self._client._enqueue({
            "type": "person_create",
            "payload": {"person_id": person_id, "properties": properties or {}},
        })

    def update(self, person_id: str, properties: dict[str, Any]) -> None:
        self._client._enqueue({
            "type": "person_update",
            "payload": {"person_id": person_id, "properties": properties},
        })


class DunnoClient_Agents:
    def __init__(self, client: "DunnoClient") -> None:
        self._client = client

    def create(self, agent_name: str, description: Optional[str] = None) -> None:
        self._client._enqueue({
            "type": "agent_create",
            "payload": {"agent_name": agent_name, "description": description},
        })


class DunnoClient_AgentVersions:
    def __init__(self, client: "DunnoClient") -> None:
        self._client = client

    def create(self, agent_name: str, agent_version_name: str, description: Optional[str] = None) -> None:
        self._client._enqueue({
            "type": "agent_version_create",
            "payload": {
                "agent_name": agent_name,
                "agent_version_name": agent_version_name,
                "description": description,
            },
        })


class DunnoClient:
    """
    Non-blocking DunnoClient. Events are sent in a background thread.
    Call close() when shutting down to flush remaining events.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
    ) -> None:
        self._api_key = api_key or os.environ.get("DUNNO_API_KEY", "")
        self._base_url = base_url or os.environ.get("DUNNO_BASE_URL", _DEFAULT_BASE_URL)
        self._queue: queue.Queue[dict | None] = queue.Queue()
        self._fingerprint_id: Optional[str] = None

        self.events = DunnoClient_Events(self)
        self.people = DunnoClient_People(self)
        self.agents = DunnoClient_Agents(self)
        self.agent_versions = DunnoClient_AgentVersions(self)

        self._http = httpx.Client(
            base_url=self._base_url,
            headers={"X-API-Key": self._api_key},
            timeout=10.0,
        )

        # Boot: register fingerprint, then start worker
        self._init_fingerprint()
        self._thread = threading.Thread(target=self._worker, daemon=True)
        self._thread.start()

    def _init_fingerprint(self) -> None:
        import platform, sys
        try:
            r = self._http.put("/api/v1/fingerprints", json={
                "language": "python",
                "language_version": sys.version,
                "sdk_version": "0.1.0",
                "system": platform.system() + " " + platform.release(),
            })
            if r.is_success:
                self._fingerprint_id = r.json().get("fingerprint_id")
        except Exception:
            pass

    def _enqueue(self, item: dict) -> None:
        self._queue.put_nowait(item)

    def _worker(self) -> None:
        while True:
            item = self._queue.get()
            if item is None:
                break
            try:
                self._dispatch(item)
            except Exception:
                pass

    def _dispatch(self, item: dict) -> None:
        t = item["type"]
        p = item["payload"]

        if t == "event":
            payload: dict[str, Any] = {**p}
            if self._fingerprint_id:
                payload["fingerprint_id"] = self._fingerprint_id
            # Remove None values
            payload = {k: v for k, v in payload.items() if v is not None}
            self._http.post("/api/v1/events", json=payload)

        elif t == "person_create":
            self._http.put("/api/v1/people", json=p)

        elif t == "person_update":
            person_id = p.pop("person_id")
            self._http.put(f"/api/v1/people/{person_id}", json=p)

        elif t == "agent_create":
            self._http.put("/api/v1/agents", json=p)

        elif t == "agent_version_create":
            agent_name = p["agent_name"]
            self._http.put(
                f"/api/v1/agents/{agent_name}/agent-versions",
                json={"agent_version_name": p["agent_version_name"], "description": p.get("description")},
            )

    def close(self) -> None:
        self._queue.put(None)
        self._thread.join(timeout=5)
        self._http.close()

    def __enter__(self) -> "DunnoClient":
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()
