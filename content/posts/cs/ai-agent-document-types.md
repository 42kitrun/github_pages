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

AI Agent에게 "유저 로그인 만들어줘"라고 하면 어떻게 되는가? Agent는 나름대로 해석하고 구현하지만, 결과가 기대와 다를 때가 많다. 원인은 대부분 **자연어의 모호함**이다. 자연어는 맥락에 따라 의미가 달라지고, Agent는 그 맥락을 추측으로 채운다.

문서가 구조화될수록 Agent가 더 정확하게 이해한다. 구조화된 문서는 의도를 명확히 전달하고 Agent가 추측할 여지를 줄인다. 아래 6가지 문서 유형은 각자 다른 역할을 하며, 상황에 맞게 조합해 쓰는 것이 핵심이다.

![AI Agent와의 소통 효율을 높이는 주요 문서 유형 인포그래픽|697](/assets/posts/cs/ai_agent_document_types_infographic.svg)

---

## 1. UML 다이어그램 — 구조·행동·상호작용

**UML(Unified Modeling Language)** 은 시스템의 구조와 동작을 시각적으로 표현하는 표기법이다. Agent와 협업할 때 잘 통하는 다이어그램은 세 가지다.

- **클래스 다이어그램**: 객체 간 관계, 속성, 메서드를 명시한다. Agent가 데이터 구조를 오해 없이 구현할 수 있다.
- **시퀀스 다이어그램**: 컴포넌트 간 메시지 흐름과 순서를 표현한다. "어떤 순서로 호출하는가"를 정확히 전달한다.
- **유스케이스 다이어그램**: 누가 어떤 기능을 사용하는지 표현한다. 기능 범위를 한정하는 데 쓴다.

UML이 있으면 Agent는 관계와 순서를 추측 없이 파악한다. 코드 생성 정확도가 올라가는 건 자연스러운 결과다.

> PlantUML이나 Mermaid 같은 텍스트 기반 UML 도구를 활용하면 대화에 붙여넣기만 해도 Agent가 즉시 해석할 수 있다.

---

## 2. OpenAPI / Swagger — API 스펙 문서

**OpenAPI Specification**은 REST API의 엔드포인트, 요청/응답 스키마, 파라미터를 YAML 또는 JSON으로 정의한 문서다. API를 설계하거나 구현할 때 Agent에게 넘기면 가장 효과가 크다.

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

`paths`(엔드포인트 정의), `schemas`(데이터 구조), `responses`(응답 형태). 이 세 가지가 있으면 Agent는 API 호출 코드를 바로 생성하고 입출력 타입을 파악한다. "어떤 데이터를 보내고 무엇을 받는가"를 추측할 여지가 없어진다.

---

## 3. ERD — 데이터 모델 문서

**ERD(Entity Relationship Diagram)** 는 데이터베이스의 테이블 구조와 관계를 표현한다. UML의 클래스 다이어그램과 유사하지만, DB 설계에 특화된 표기법이다.

ERD의 핵심 구성 요소는 세 가지다.

| 요소 | 설명 |
|------|------|
| PK / FK | 기본키와 외래키 관계 명시 |
| 카디널리티 | 1:1, 1:N, N:M 관계 정의 |
| 정규화 | 중복 제거, 데이터 일관성 보장 |

ERD가 있으면 Agent는 DDL을 바로 생성할 수 있다. 테이블 생성 순서, 외래키 제약 조건, 인덱스까지 스스로 판단한다. 데이터 흐름과 의존성이 명확해서 CDW/CDM 설계에도 필수다.

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

이 형식으로 전달하면 작업 범위가 딱 잘린다. 완료 기준(DoD)이 있으니 반복 수정도 줄어든다. Agent가 "어디까지 구현해야 하는가"를 추측할 필요 없이 그대로 따라가면 된다. 처음부터 원하는 결과가 나올 확률이 높아진다.

---

## 5. System Architecture — 아키텍처 문서

**시스템 아키텍처 문서**는 전체 기술 스택의 구성, 컴포넌트 간 의존성, 레이어 구조를 표현한다. 기능 단위가 아닌 시스템 전체를 조망하는 문서다.

대표적인 다이어그램 유형은 세 가지다.

- **C4 Model**: Context → Container → Component → Code 계층으로 시스템을 설명한다.
- **레이어드 아키텍처**: Presentation, Business Logic, Data Access 레이어를 분리해 표현한다.
- **인프라 맵**: AWS, Kubernetes 등 배포 환경의 실제 구성을 시각화한다.

아키텍처 문서가 있으면 Agent는 전체 기술 스택을 파악한 상태에서 작업한다. 특정 컴포넌트를 수정할 때 영향 범위를 스스로 판단하고, AWS나 인프라 구성도 맥락에 맞게 제안한다. **전체 그림을 알고 있어야 부분 수정도 정확하다**.

---

## 6. Data Dictionary — 메타데이터 문서

**Data Dictionary**는 데이터베이스의 각 컬럼이 실제로 무엇을 의미하는지 정의한 문서다. ERD가 구조를 표현한다면, Data Dictionary는 **비즈니스 의미**를 정의한다.

| 컬럼명 | 데이터타입 | 설명 |
|--------|-----------|------|
| `user_id` | UUID | 사용자 고유 식별자 (PK) |
| `created_at` | TIMESTAMP | 계정 생성 시각 (UTC) |
| `status` | ENUM | `active`, `inactive`, `suspended` 중 하나 |

컬럼명만으로는 의미를 알 방법이 없는 경우가 많다. `status`가 어떤 값을 가지는지, `amount`가 세전인지 세후인지, `code`가 어떤 표준(예: LOINC, ICD-10)을 따르는지는 컬럼명에서 읽을 수 없다.

Data Dictionary가 있으면 Agent는 컬럼 의미를 잘못 해석하지 않는다. 정확한 쿼리가 나온다. 도메인 코드 매핑이 필요한 의료·금융 데이터나 ETL 파이프라인에서는 특히 없어선 안 된다.

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
