---
title: AI Agent와 소통 효율을 높이는 6가지 문서 유형
date: 2026-06-01
updated: 2026-06-01
tags:
  - ai-agent
  - uml
  - openapi
  - erd
  - prd
  - user-story
  - system-architecture
  - data-dictionary
  - documentation
  - software-design
  - structured-communication
summary: "AI Agent에게 의도를 정확히 전달하려면 자연어의 모호함을 줄이는 구조화된 문서가 필요하다. UML부터 Data Dictionary까지 6가지 핵심 문서 유형을 정리한다."
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# AI Agent와 소통 효율을 높이는 6가지 문서 유형

_written by Claude-Code_

AI Agent에게 "유저 로그인 만들어줘"라고 말하면 어떤 일이 벌어지는가? Agent는 나름대로 해석하고 구현하지만, 그 결과가 기대와 다를 때가 많다. 원인은 대부분 **자연어의 모호함**에 있다. 자연어는 맥락에 따라 의미가 달라지고, Agent는 그 맥락을 추측에 의존한다.

문서가 구조화될수록 AI Agent의 컨텍스트 이해 정확도가 높아진다. 구조화된 문서는 의도를 명확하게 고정하고 Agent의 불필요한 추측을 제거한다. 아래 6가지 문서 유형은 각기 다른 역할을 수행하며, 상황에 맞게 조합해 사용하는 것이 핵심이다.

![AI Agent와의 소통 효율을 높이는 주요 문서 유형 인포그래픽|697](/assets/posts/cs/ai_agent_document_types_infographic.svg)

---

## 1. UML 다이어그램 — 구조·행동·상호작용

**UML(Unified Modeling Language)** 은 시스템의 구조와 동작을 시각적으로 표현하는 표기법이다. AI Agent에게 전달할 때 가장 강력한 효과를 내는 대표 다이어그램은 세 가지다.

- **클래스 다이어그램**: 객체 간 관계, 속성, 메서드를 명시한다. Agent가 데이터 구조를 오해 없이 구현하도록 유도한다.
- **시퀀스 다이어그램**: 컴포넌트 간 메시지 흐름과 순서를 표현한다. "어떤 순서로 호출하는가"를 정확히 전달한다.
- **유스케이스 다이어그램**: 누가 어떤 기능을 사용하는지 표현한다. 기능 범위를 한정하는 데 효과적이다.

UML은 시스템 구조와 흐름을 시각화하여 Agent가 관계·순서를 명확히 파악하게 한다. 그 결과 코드 생성 정확도가 직접적으로 향상된다.

> PlantUML이나 Mermaid 같은 텍스트 기반 UML 도구를 활용하면 대화에 붙여넣기만 해도 Agent가 즉시 해석할 수 있다.

---

## 2. OpenAPI / Swagger — API 스펙 문서

**OpenAPI Specification**은 REST API의 엔드포인트, 요청/응답 스키마, 파라미터를 YAML 또는 JSON으로 명세한 문서다. API를 설계하거나 구현할 때 Agent에게 제공하면 가장 직접적인 효과를 낸다.

```yaml
POST /users:
  requestBody:
    required: true
    content:
      application/json:
        schema:
          properties:
            email:
              type: string
            password:
              type: string
  responses:
    '201':
      content:
        application/json:
          schema:
            properties:
              token:
                type: string
```

핵심 요소는 세 가지다: `paths`(엔드포인트 정의), `schemas`(데이터 구조), `responses`(응답 형태). 이 세 가지가 명시되면 Agent는 API 호출 코드를 자동 생성하고, 입출력 타입을 즉시 추론한다. "어떤 데이터를 보내고 무엇을 받는가"에 대한 추측이 완전히 사라진다.

---

## 3. ERD — 데이터 모델 문서

**ERD(Entity Relationship Diagram)** 는 데이터베이스의 테이블 구조와 관계를 표현한다. UML의 클래스 다이어그램과 유사하지만, DB 설계에 특화된 표기법이다.

ERD에 포함되는 핵심 요소는 다음과 같다.

| 요소 | 설명 |
|------|------|
| PK / FK | 기본키와 외래키 관계 명시 |
| 카디널리티 | 1:1, 1:N, N:M 관계 정의 |
| 정규화 | 중복 제거, 데이터 일관성 보장 |

Agent에게 ERD를 제공하면 SQL DDL 생성의 핵심 입력이 된다. 테이블 생성 순서, 외래키 제약 조건, 인덱스 설계까지 자동으로 추론할 수 있다. 데이터 흐름과 의존성이 명시되어 있어 CDW/CDM 설계에도 필수적으로 활용된다.

---

## 4. PRD / User Story — 요구사항 문서

**PRD(Product Requirements Document)** 와 **User Story**는 "무엇을 만들어야 하는가"를 정의하는 문서다. 기능의 목적, 범위, 그리고 완료 기준을 명확히 한정한다.

User Story는 다음 형식으로 작성한다.

```
As a [사용자],
I want to [수행하고 싶은 행동],
So that [얻고자 하는 가치].

Acceptance Criteria:
- Given [초기 상태]
- When [행동]
- Then [기대 결과]
```

이 형식이 Agent에게 전달되면 세 가지 효과가 발생한다. 첫째, 작업 범위가 명확히 한정된다. 둘째, 완료 기준(DoD, Definition of Done)이 명시되어 반복 수정이 줄어든다. 셋째, Agent가 "어디까지 구현해야 하는가"를 스스로 추측하지 않아도 된다. 결과적으로 **한 번에 원하는 결과를 얻을 가능성이 높아진다**.

---

## 5. System Architecture — 아키텍처 문서

**시스템 아키텍처 문서**는 전체 기술 스택의 구성, 컴포넌트 간 의존성, 레이어 구조를 표현한다. 기능 단위가 아닌 시스템 전체를 조망하는 문서다.

대표적인 다이어그램 유형은 세 가지다.

- **C4 Model**: Context → Container → Component → Code 계층으로 시스템을 설명한다.
- **레이어드 아키텍처**: Presentation, Business Logic, Data Access 레이어를 분리해 표현한다.
- **인프라 맵**: AWS, Kubernetes 등 배포 환경의 실제 구성을 시각화한다.

Agent에게 아키텍처 문서를 제공하면 전체 기술 스택 컨텍스트가 전달된다. 특정 컴포넌트를 수정할 때 영향 범위를 추론할 수 있고, AWS나 인프라 구성을 설명할 때 구체적인 설계 제안을 받을 수 있다. **Agent가 전체 그림을 알고 있을 때 부분 수정의 정확도가 높아진다**.

---

## 6. Data Dictionary — 메타데이터 문서

**Data Dictionary**는 데이터베이스의 각 컬럼이 실제로 무엇을 의미하는지 정의한 문서다. ERD가 구조를 표현한다면, Data Dictionary는 **비즈니스 의미**를 정의한다.

| 컬럼명 | 데이터타입 | 설명 |
|--------|-----------|------|
| `user_id` | UUID | 사용자 고유 식별자 (PK) |
| `created_at` | TIMESTAMP | 계정 생성 시각 (UTC) |
| `status` | ENUM | `active`, `inactive`, `suspended` 중 하나 |

컬럼 이름만으로는 의미를 알 수 없는 경우가 많다. `status`가 어떤 값을 가질 수 있는지, `amount`가 세전인지 세후인지, `code`가 어떤 표준(예: LOINC, ICD-10)을 따르는지는 컬럼명만으로 추론 불가능하다.

Data Dictionary가 있으면 Agent는 컬럼 의미를 오해하지 않고 정확한 쿼리를 생성한다. 특히 도메인 코드 매핑이 필요한 의료·금융 데이터나 ETL 파이프라인 작성 시 필수적이다.

---

## 정리

| 문서 | 전달하는 것 | 핵심 효과 |
|------|------------|----------|
| UML 다이어그램 | 구조·행동·상호작용 | 코드 생성 정확도 향상 |
| OpenAPI / Swagger | API 계약 | 호출 코드 자동 생성 |
| ERD | 데이터 구조·관계 | SQL DDL 자동 생성 |
| PRD / User Story | 기능 범위·완료 기준 | 불필요한 추측 제거 |
| System Architecture | 전체 기술 스택 | 영향 범위 추론 가능 |
| Data Dictionary | 컬럼 비즈니스 의미 | 정확한 쿼리 생성 |

6가지 문서가 모두 필요한 것은 아니다. 작업의 성격에 따라 선택적으로 조합한다. DB를 새로 설계한다면 ERD와 Data Dictionary가 핵심이고, API 구현이라면 OpenAPI가 우선이다. 새 기능을 추가한다면 User Story로 범위를 한정한 뒤 UML로 구조를 설명하는 순서가 효과적이다.

핵심은 하나다. **AI Agent는 구조가 있을수록 정확하게 작동한다**.

---

[[ai-agent-development-principles|AI Agent 개발 원칙]]
[[rest-restful-api-design-principles|REST/RESTful API 설계 원칙]]
[[login-types-osi-payload|로그인 유형과 OSI 레이어]]
