---
title: REST와 RESTful API — 6원칙으로 이해하는 설계 철학
date: 2026-05-28
updated: 2026-05-28
tags:
  - rest
  - restful
  - api
  - api-design
  - http
  - web-architecture
  - client-server
  - stateless
  - hateoas
  - uniform-interface
  - caching
  - layered-system
  - backend
  - web-api
  - software-architecture
summary: "REST, REST API, RESTful API 세 용어의 차이를 정리하고, 6가지 아키텍처 제약 조건과 HATEOAS를 실무 관점에서 해설한다"
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# REST와 RESTful API — 6원칙으로 이해하는 설계 철학

_written by Claude-Code_

"REST API를 만든다"는 말은 흔하게 쓰이지만, REST가 정확히 무엇인지, RESTful과는 어떻게 다른지 묻는다면 명확하게 답하기 어려운 경우가 많다. REST는 API 스펙이 아니라 **아키텍처 스타일**이고, RESTful은 그 스타일을 얼마나 따랐는지를 나타내는 수식어다. 이 구분을 출발점으로, 6가지 제약 조건을 하나씩 살펴본다.

---

## REST란 무엇인가

REST(Representational State Transfer)는 Roy Fielding이 2000년 박사 논문에서 정의한 **분산 하이퍼미디어 시스템을 위한 아키텍처 스타일**이다. HTTP 프로토콜 자체를 설계하는 데도 영향을 미쳤다.

중요한 것은 REST가 특정 기술이나 프로토콜 스펙이 아니라는 점이다. REST는 **6개의 제약 조건(Constraints)** 으로 구성되며, 이 조건을 모두 만족하는 시스템을 RESTful 시스템이라고 부른다.

```
REST (설계 철학, 제약 조건의 집합)
        ↓  얼마나 따르는가?
RESTful (준수 정도를 나타내는 수식어)
        ↓  구체적으로 구현된 것
RESTful API (REST 원칙을 적용한 HTTP API)
```

---

## REST, REST API, RESTful API — 세 용어의 차이

세 용어는 실무에서 혼용되지만 엄밀히 따지면 다르다.

| 용어 | 정의 |
|------|------|
| **REST** | Roy Fielding이 정의한 아키텍처 스타일 (6원칙의 집합, 구현체 없음) |
| **REST API** | HTTP 기반 API — REST 원칙을 "어느 정도" 따른다는 느슨한 표현 |
| **RESTful API** | REST 6원칙을 충실히 준수한 API. 이론상 HATEOAS까지 포함 |

```
REST            → 설계 철학
REST API        → "REST 스타일로 만들었다"는 관행적 표현 (준수 정도 불명확)
RESTful API     → REST 원칙을 엄격히 따른 API (이론적으로 더 엄격)
```

Fielding 본인은 블로그에서 이렇게 말했다:

> "제발 당신의 HTTP API를 RESTful이라고 부르지 마세요. HATEOAS 없이는 REST가 아닙니다."

그의 기준으로는 오늘날 REST API라고 불리는 대부분은 사실상 **HTTP API**다. 실무에서는 이 구분을 크게 신경 쓰지 않고 REST API와 RESTful API를 동의어로 쓰는 경우가 많다.

---

## 6가지 제약 조건

### 1. Client-Server (클라이언트-서버 분리)

UI와 데이터 저장 관심사를 분리한다. 클라이언트는 데이터 저장 방식에 신경 쓰지 않고, 서버는 클라이언트 UI에 관여하지 않는다.

이 분리를 통해 클라이언트와 서버가 독립적으로 진화할 수 있다. 웹 브라우저와 모바일 앱이 같은 서버 API를 공유할 수 있는 것도 이 원칙 덕분이다.

### 2. Stateless (무상태)

**서버는 클라이언트의 상태를 기억하지 않는다.** 각 요청은 처리에 필요한 모든 정보를 스스로 포함해야 한다.

```
❌ Stateful
요청 1: 로그인 → 서버가 세션 저장
요청 2: 데이터 조회 → 서버가 세션으로 인증 확인

✅ Stateless
요청 1: GET /data + Authorization: Bearer {token}
요청 2: GET /data + Authorization: Bearer {token}  ← 매번 인증 정보 포함
```

무상태 설계는 서버 확장성을 높인다. 어떤 서버 인스턴스가 요청을 처리하든 동일한 결과를 낼 수 있기 때문이다.

### 3. Cacheable (캐시 가능)

응답은 캐시 가능 여부를 명시해야 한다. 캐시 가능한 응답은 클라이언트가 재사용할 수 있어 네트워크 비용과 서버 부하를 줄인다.

HTTP에서는 `Cache-Control`, `ETag`, `Last-Modified` 헤더로 이를 구현한다.

```http
HTTP/1.1 200 OK
Cache-Control: max-age=3600
ETag: "abc123"
```

### 4. Uniform Interface (일관된 인터페이스)

REST의 핵심이자 가장 복잡한 원칙이다. 4개의 서브 제약 조건으로 구성된다.

| 서브 원칙 | 의미 | 예시 |
|-----------|------|------|
| **Resource Identification** | URI로 리소스를 식별 | `/users/1`, `/posts/42` |
| **Manipulation through Representations** | 리소스 자체가 아닌 표현(JSON, XML)을 교환 | `{"id": 1, "name": "Alice"}` |
| **Self-descriptive Messages** | 메시지 안에 처리 방법이 포함 | `Content-Type: application/json` |
| **HATEOAS** | 응답에 다음 행동 링크 포함 | 아래 참조 |

**HATEOAS** (Hypermedia As The Engine Of Application State)는 응답 본문에 관련 링크를 포함해, 클라이언트가 API 문서 없이도 다음 행동을 탐색할 수 있도록 하는 원칙이다.

```json
{
  "id": 1,
  "name": "Alice",
  "_links": {
    "self": { "href": "/users/1" },
    "posts": { "href": "/users/1/posts" },
    "delete": { "href": "/users/1", "method": "DELETE" }
  }
}
```

### 5. Layered System (계층화 시스템)

클라이언트는 최종 서버와 직접 연결되어 있는지, 중간 레이어(프록시, 로드 밸런서, CDN, 게이트웨이)를 거치는지 알 필요가 없다. 중간 레이어의 존재가 클라이언트의 동작에 영향을 주어서는 안 된다.

```
클라이언트 → [CDN] → [Load Balancer] → [API Gateway] → 서버
              ← 클라이언트는 이 구조를 알지 못해도 동작함 →
```

### 6. Code on Demand (선택적)

서버가 클라이언트에 실행 가능한 코드(JavaScript 등)를 전달해 클라이언트의 기능을 확장할 수 있다. 6가지 원칙 중 **유일하게 선택 사항**이다.

웹 브라우저에서 서버가 JS 파일을 내려주는 방식이 이 원칙의 대표적인 예다.

---

## 실무에서의 현실

이론적으로 HATEOAS까지 완전히 구현해야 진정한 RESTful이지만, 대부분의 실무 API는 HATEOAS를 구현하지 않는다.

```
Level 0  HTTP 터널링 (XML-RPC 방식)
Level 1  리소스 분리 (/users, /posts)
Level 2  HTTP 동사 활용 (GET, POST, PUT, DELETE)  ← 대부분의 "REST API"
Level 3  HATEOAS 적용  ← 완전한 REST
```

Richardson Maturity Model 기준으로 Level 2가 실무 표준이다. Level 3까지 구현하면 API 탐색성이 높아지지만, 클라이언트 복잡도와 응답 크기가 증가한다는 트레이드오프가 있다.

---

## 정리

| 용어 | 정의 |
|------|------|
| **REST** | 6가지 제약 조건으로 구성된 아키텍처 스타일 |
| **REST API** | REST 스타일을 따른다는 관행적 표현의 HTTP API |
| **RESTful** | REST 제약 조건을 준수하는 정도를 나타내는 수식어 |
| **RESTful API** | REST 원칙을 엄격히 적용해 설계된 HTTP API |

REST는 특정 기술 스펙이 아니라 설계 철학이다. 6원칙을 이해한다는 것은 단순히 URL을 `/getUser` 대신 `/users/1`로 바꾸는 것이 아니라, **확장 가능하고 독립적으로 진화할 수 있는 시스템**을 어떻게 설계하는지를 이해하는 것이다.

---

**관련 포스트**
- [[tcp-ip-web-http|TCP/IP, Web, HTTP 한눈에 이해하기]]
- [[why-backend-architecture-grows-complex|백엔드 아키텍처는 왜 복잡해지는가]]
- [[software-architecture-terms|소프트웨어 아키텍처 용어 정리]]
