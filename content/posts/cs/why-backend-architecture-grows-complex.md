---
title: 왜 백엔드 아키텍처는 점점 더 복잡해지는가
date: 2026-05-20
updated: 2026-05-20
tags:
  - backend-architecture
  - layered-architecture
  - clean-architecture
  - hexagonal-architecture
  - modular-monolith
  - cqrs
  - event-sourcing
  - microservices
  - software-design
  - domain-driven-design
  - dependency-inversion
  - separation-of-concerns
  - database-normalization
  - system-design
  - software-engineering
  - architecture-patterns
summary: "레이어드부터 마이크로서비스까지, 백엔드 아키텍처가 복잡해진 이유를 각 패턴의 등장 서사와 함께 일목요연하게 정리한다."
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# 왜 백엔드 아키텍처는 점점 더 복잡해지는가

_written by Claude-Code_

데이터 아키텍처를 공부하면 처음부터 정규화를 배운다. "왜 이렇게 테이블을 쪼개야 하는가?" 처음엔 하나의 테이블에 모든 걸 다 넣으면 단순하고 편해 보인다. 그러나 데이터가 늘어나면 중복이 쌓이고, 중복은 이상 현상(Anomaly)을 낳는다. 정규화는 그 문제가 생겨서야 비로소 정당화된다.

백엔드 아키텍처도 정확히 같은 논리로 복잡해진다. 처음부터 복잡하게 설계하는 게 아니라, **문제가 생길 때마다 구조를 분리해온 역사**가 지금의 복잡한 아키텍처를 만들었다.

---

## 출발점: 모든 것이 Service에 들어가던 시대

### 레이어드 아키텍처 (Layered / MVC)

백엔드를 처음 배우면 자연스럽게 3계층 구조를 익힌다.

```
HTTP 요청
    ↓
Controller  ← 요청/응답 처리
    ↓
Service     ← 비즈니스 로직
    ↓
Repository  ← DB 접근
```

직관적이고, FastAPI나 Spring, Django 같은 프레임워크가 기본으로 권장하는 구조다. 사이드 프로젝트나 소규모 CRUD API에서는 지금도 이 구조가 최선의 선택이다.

**문제는 서비스가 성장할 때 나타난다.**

비즈니스 로직이 늘어나면 Service 클래스가 비대해진다. 사용자 생성, 이메일 발송, 포인트 적립, 알림 처리까지 모두 `UserService`에 쌓인다. 이른바 **God Service** 현상이다. 한 파일이 5000줄을 넘어서면 변경이 두렵고, 테스트는 DB 연결 없이 불가능해진다.

> "왜 Service가 커지면 문제인가?" — 레이어드 아키텍처에서 레이어 간 결합이 높기 때문이다. Service는 Repository를 직접 호출하고, Repository는 특정 ORM에 묶인다. DB를 바꾸면 Service까지 수정해야 한다.

---

## 1차 분리: 의존성 방향을 뒤집어라

### 클린 아키텍처 (Clean Architecture)

Uncle Bob(Robert C. Martin)이 제시한 클린 아키텍처의 핵심 규칙은 단 하나다.

> **의존성은 항상 안쪽(Domain)을 향해야 한다.**

```
[외부: DB, 프레임워크, 외부 API]
           ↓ 의존
[Infrastructure — 실 구현체]
           ↓ 의존
[Application — 유스케이스]
           ↓ 의존
[Domain — 순수 비즈니스 규칙]  ← 의존받지 않음
```

`UserRepository`는 더 이상 SQLAlchemy 클래스가 아니다. Domain 레이어에 **인터페이스(추상)**만 선언하고, 실제 DB 구현은 Infrastructure 레이어에 넣는다. 덕분에 도메인은 DB가 PostgreSQL인지 MongoDB인지 알지 못한다. 순수 Python/Java 객체만으로 비즈니스 로직을 테스트할 수 있게 된다.

**해결한 문제**: 도메인 로직과 외부 의존성의 결합  
**새로 생긴 문제**: 인터페이스, DTO, 유스케이스 클래스가 늘어나며 보일러플레이트 코드가 급증한다. 소규모 프로젝트에는 오버엔지니어링이다.

---

## 2차 분리: 진입점이 여러 개라면?

### 헥사고날 아키텍처 (Hexagonal / Ports & Adapters)

클린 아키텍처를 적용하고 나면 새 질문이 생긴다. "REST API 말고 gRPC도 지원해야 하는데, CLI도 필요한데, 어디에 어떻게 연결하나?"

헥사고날 아키텍처는 이 문제를 **Port(인터페이스)와 Adapter(외부 연결)** 개념으로 명시화한다.

```
[Primary Adapters]     [Core Domain]     [Secondary Adapters]
 REST API      ──→  [  Input Port  ]  ←──  PostgreSQL Adapter
 gRPC          ──→  [   Domain     ]  ←──  Kafka Adapter
 CLI           ──→  [ Output Port  ]  ←──  S3 Adapter
```

- **Primary(Driving) Adapter**: 애플리케이션을 구동하는 쪽. REST, gRPC, CLI, 이벤트 컨슈머.
- **Secondary(Driven) Adapter**: 애플리케이션이 호출하는 쪽. DB, 메시지 큐, 외부 API.

진입점이 하나인 서비스에서는 클린 아키텍처와 큰 차이가 없지만, **다양한 프로토콜을 동시에 지원**해야 하는 서비스에서 구조가 명확해진다.

**해결한 문제**: 다양한 진입점과 외부 의존성의 혼재  
**새로 생긴 문제**: Port와 Adapter 경계 설계 자체가 어렵고, 팀 전체가 이 개념을 숙지해야 한다.

---

## 3차 분리: 팀이 커지면 단일 코드베이스가 흔들린다

### 모듈러 모놀리스 (Modular Monolith)

클린 아키텍처나 헥사고날로 잘 정돈된 코드베이스도 팀이 커지면 문제가 생긴다. 사용자 도메인을 담당하는 팀과 주문 도메인을 담당하는 팀이 같은 Service 폴더에서 충돌한다. 경계 없이 서로의 코드를 참조하기 시작한다.

모듈러 모놀리스는 여전히 **단일 프로세스**로 배포하지만, 내부를 도메인별 모듈로 엄격히 분리한다.

```
src/
└── modules/
    ├── users/      ← 사용자 팀 소유
    │   ├── domain/
    │   ├── application/
    │   └── api/
    ├── orders/     ← 주문 팀 소유
    └── payments/   ← 결제 팀 소유
```

모듈 간 직접 함수 호출은 금지한다. **도메인 이벤트나 공개 인터페이스로만 통신**한다. 이 규칙을 지키면, 나중에 모듈을 독립 서비스로 분리할 때 훨씬 쉬워진다.

**해결한 문제**: 팀 간 코드 경계 부재  
**새로 생긴 문제**: 공유 DB를 여전히 함께 쓰기 때문에 스키마 변경이 다른 모듈에 영향을 준다.

---

## 4차 분리: 읽기와 쓰기의 요구사항이 너무 다르다

### CQRS + 이벤트 소싱

대부분의 서비스에서 읽기(Query)는 쓰기(Command)보다 훨씬 빈번하게 발생한다. 그런데 같은 DB 모델로 두 가지를 모두 처리하면 서로 발목을 잡는다. 읽기에 최적화된 인덱스가 쓰기 성능을 저하시키고, 쓰기에 최적화된 정규화된 테이블은 복잡한 조회 쿼리를 낳는다.

**CQRS(Command Query Responsibility Segregation)**는 읽기 모델과 쓰기 모델을 물리적으로 분리한다.

```
[Client]
   ├── Command → Write DB (PostgreSQL, 정규화)
   │               ↓ 이벤트 발행
   └── Query  ← Read DB (Redis / Elasticsearch, 역정규화)
```

여기에 **이벤트 소싱(Event Sourcing)**을 결합하면, DB에 현재 상태 대신 발생한 이벤트를 순서대로 저장한다. `OrderCreated`, `OrderPaid`, `OrderShipped` 이벤트를 재처리하면 언제든 특정 시점의 상태를 복원할 수 있다. 금융, 의료처럼 완전한 감사 이력이 필요한 도메인에서 강점을 발휘한다.

**해결한 문제**: 읽기/쓰기 트래픽 불균형, 감사 이력  
**새로 생긴 문제**: Eventual Consistency를 처리하는 코드가 필요하다. "방금 주문했는데 조회가 안 된다"는 상황이 설계상 가능해진다. 복잡도가 급격히 증가한다.

---

## 5차 분리: 팀 독립 배포가 필요해졌다

### 마이크로서비스 (Microservices)

모듈러 모놀리스도 결국 하나의 프로세스다. 결제 서비스에 버그가 생기면 전체를 재배포해야 한다. 결제 팀은 주문 팀의 릴리즈 일정을 기다려야 한다. 트래픽이 폭증하면 필요한 서비스만 선택적으로 스케일 아웃할 수 없다.

마이크로서비스는 이 문제를 근본적으로 해결한다. 각 서비스는 독립적으로 배포되고, 자체 DB를 가지며, API Gateway를 통해 외부에 노출된다.

```
Client
  ↓
API Gateway  ← 단일 진입점
  ├── /users      → user-service (독립 배포)
  ├── /orders     → order-service (독립 배포)
  ├── /payments   → payment-service (독립 배포)
  └── /notify     → notification-service (독립 배포)
```

**해결한 문제**: 팀 독립성, 서비스별 스케일링, 장애 격리  
**새로 생긴 문제**: 운영 복잡도가 폭발한다. 서비스 디스커버리, 분산 트레이싱, 분산 트랜잭션(Saga 패턴), Kubernetes 운영까지 필요해진다. "배포는 쉬워졌지만 운영이 어려워졌다"는 역설이 생긴다.

---

## 전체 진화 지도

아래 인터랙티브 탐색기에서 각 아키텍처 패턴의 폴더 구조, 장단점, 적용 시점을 직접 확인할 수 있다.

<style>
.bam-wrap{display:flex;border:1px solid var(--lightgray);border-radius:8px;overflow:hidden;min-height:520px}
.bam-sidebar{width:204px;flex-shrink:0;border-right:1px solid var(--lightgray);background:var(--lightgray);padding:10px 8px;overflow-y:auto}
.bam-sidebar-header{font-size:10px;font-weight:600;color:var(--gray);letter-spacing:.06em;text-transform:uppercase;padding:2px 8px;margin-bottom:8px}
.bam-pattern-btn{display:block;width:100%;text-align:left;padding:8px 10px;border-radius:5px;border:1px solid transparent;background:none;cursor:pointer;font-family:var(--bodyFont);transition:background .1s,border-color .1s;margin-bottom:4px}
.bam-pattern-btn:hover{background:var(--light)}
.bam-pattern-btn.bam-active{background:var(--light);border-color:var(--gray)}
.bam-pattern-name{display:block;font-size:13px;font-weight:500;color:var(--dark)}
.bam-pattern-en{display:block;font-size:10.5px;color:var(--gray);margin-top:1px}
.bam-pattern-tag{display:inline-block;font-size:10px;padding:1px 7px;border-radius:20px;margin-top:4px}
.bam-content{flex:1;padding:18px 20px;overflow:auto;background:var(--light)}
.bam-content-header{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.bam-content-title{font-size:15px;font-weight:500;color:var(--dark)}
.bam-content-badge{font-size:11px;padding:2px 10px;border-radius:20px}
.bam-content-en{font-size:11px;color:var(--gray);font-family:var(--codeFont);margin-bottom:10px}
.bam-content-desc{font-size:13px;color:var(--darkgray);line-height:1.65;margin-bottom:12px}
.bam-when{font-size:12px;padding:8px 12px;background:var(--lightgray);border-radius:5px;margin-bottom:14px;color:var(--darkgray);border:1px solid var(--lightgray)}
.bam-tree{background:var(--lightgray);border-radius:5px;padding:12px 14px;border:1px solid var(--lightgray);margin-bottom:12px;overflow-x:auto;white-space:pre;font-family:var(--codeFont);font-size:11.5px;line-height:1.8;color:var(--darkgray)}
.bam-pros-cons{display:flex;gap:8px}
.bam-pros-cons-box{flex:1;padding:10px 12px;border-radius:5px;border:1px solid var(--lightgray)}
.bam-pros-cons-title{font-size:11px;font-weight:500;margin-bottom:6px}
.bam-pros-cons-item{font-size:12px;color:var(--darkgray);line-height:1.55}
@media(max-width:520px){.bam-wrap{flex-direction:column}.bam-sidebar{width:100%;border-right:none;border-bottom:1px solid var(--lightgray)}}
</style>

<div class="bam-wrap">
  <div class="bam-sidebar">
    <div class="bam-sidebar-header">패턴 선택</div>
    <div id="bam-list"></div>
  </div>
  <div class="bam-content" id="bam-detail">로딩 중...</div>
</div>

<script src="/static/interactive/bam.js"></script>

---

## 복잡해진 이유는 두 가지 축이다

모든 진화를 돌아보면 복잡도가 증가한 이유는 두 축으로 압축된다.

### 축 1: 도메인 복잡도

비즈니스 규칙이 늘어날수록 코드가 뒤엉킨다. 이를 해결하기 위해 의존성 방향을 통제하고(Clean Architecture), 진입점을 분리하고(Hexagonal), 읽기/쓰기 모델을 나눈다(CQRS).

### 축 2: 운영 복잡도

팀이 커지고 트래픽이 늘어날수록 단일 배포 단위가 병목이 된다. 이를 해결하기 위해 도메인을 모듈로 나누고(Modular Monolith), 최종적으로 독립 서비스로 분리한다(Microservices).

```
도메인 복잡도 증가
       ↓
레이어드 → 클린 아키텍처 → 헥사고날 → CQRS

운영 복잡도 증가
       ↓
레이어드 → 모듈러 모놀리스 → 마이크로서비스
```

두 축은 독립적으로 작동한다. 마이크로서비스를 도입했다고 해서 도메인이 잘 분리된 것은 아니다. 반대로, 클린 아키텍처를 완벽하게 적용해도 팀 독립 배포 문제는 해결되지 않는다.

---

## 그렇다면 어떤 아키텍처를 선택해야 하는가

정규화처럼, 아키텍처도 **현재 직면한 문제에 맞춰 선택**해야 한다. 문제가 없는데 미리 분리하는 것은 오버엔지니어링이다.

| 상황 | 적합한 아키텍처 |
|------|----------------|
| 사이드 프로젝트, 빠른 MVP | 레이어드 (MVC) |
| 도메인 로직이 복잡하고 장기 유지보수 필요 | 클린 아키텍처 |
| 다양한 프로토콜 지원 (REST + gRPC + CLI) | 헥사고날 |
| 팀이 나뉘어 있고 마이크로서비스 전환 고려 중 | 모듈러 모놀리스 |
| 읽기/쓰기 트래픽 차이가 크고 감사 이력 필요 | CQRS + 이벤트 소싱 |
| 대규모 팀, 서비스별 독립 배포 필수 | 마이크로서비스 |

복잡한 아키텍처가 나쁜 게 아니다. 그 복잡도가 해결하는 문제가 실제로 존재한다면, 그것은 정당한 복잡도다. 반대로, 해결할 문제가 없는데 도입된 복잡도는 팀을 소진시킨다.

백엔드 아키텍처가 점점 복잡해진 이유는 단순하다. **현실의 문제가 그만큼 다양하고 복잡해졌기 때문이다.**

---

*관련 포스트: [[software-architecture-terms|소프트웨어 아키텍처 핵심 용어 정리]] · [[ai-agent-development-principles|AI Agent는 어떤 개발 원칙으로 코드를 작성하는가]]*
