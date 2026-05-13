---
title: 데이터베이스 회복 기법 완전 정리 — 로그 기반부터 ARIES까지
date: 2026-05-13
updated: 2026-05-13
tags:
  - database
  - recovery
  - aries
  - wal
  - transaction
  - undo
  - redo
  - logging
  - checkpoint
  - shadow-paging
  - lsn
  - durability
  - acid
  - dbms
  - postgresql
  - mysql
  - sql-server
summary: "데이터베이스 장애 발생 시 일관성을 보장하는 주요 회복 기법을 비교하고, 현대 RDBMS의 표준인 ARIES 알고리즘을 3단계 회복 과정 중심으로 해부한다."
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# 데이터베이스 회복 기법 완전 정리 — 로그 기반부터 ARIES까지

_written by Claude-Code_

데이터베이스는 언제든 장애가 발생할 수 있다. 전원 차단, 시스템 크래시, 디스크 손상, 네트워크 단절 — 어떤 장애가 와도 데이터의 일관성을 보장해야 한다. 이를 위한 메커니즘이 **회복(Recovery)** 이다.

회복이란 장애 이후 손상된 데이터베이스를 마지막으로 일관된 상태로 되돌리는 과정이다. ACID 속성 중 **지속성(Durability)** 을 보장하는 핵심 수단이기도 하다.

---

## 회복의 기본 흐름

장애가 발생하면 DBMS는 다음 순서로 회복을 수행한다.

```
장애 발생
    │
    ▼
로그 분석 ── 커밋/미커밋 트랜잭션 파악
    │
    ▼
UNDO (롤백) ── 미커밋 트랜잭션의 변경 내용 취소
    │
    ▼
REDO (재실행) ── 커밋된 트랜잭션의 변경 내용 재실행
    │
    ▼
일관된 상태 복원 완료 (Durability 보장)
```

모든 회복 기법은 이 흐름 위에서 UNDO와 REDO를 **어떻게, 언제, 어디까지** 수행하느냐에 따라 나뉜다.

![데이터베이스 주요 회복 기법 전체 정리](/assets/posts/data/database-recovery-techniques/Database_recovery.png)

---

## 주요 회복 기법 비교

### 1. 즉시 갱신 (Immediate Update)

트랜잭션이 커밋되기 전이라도 변경 내용을 데이터베이스에 즉시 반영한다. 장애 발생 시 미커밋 트랜잭션에 대한 UNDO가 필요하다.

- **로그**: UNDO 로그 필요
- **UNDO**: 필요 / **REDO**: 불필요
- **단점**: 장애 시 전체 UNDO 비용, 성능 오버헤드
- **채택**: 초기 시스템, 교육용

### 2. 지연 갱신 (Deferred Update)

커밋이 확정될 때까지 변경 내용을 버퍼에만 유지하고 데이터베이스에는 반영하지 않는다. 장애 발생 시 DB에 반영된 내용이 없으므로 UNDO가 불필요하다.

- **로그**: UNDO 로그 필요
- **UNDO**: 불필요 / **REDO**: 없음
- **단점**: 커밋 시점 장애는 데이터 손실로 이어질 수 있음
- **채택**: 일부 학술 시스템

### 3. UNDO 기반 회복 (UNDO Logging)

변경 **이전 값(Before Image)** 을 로그에 기록한다. 미완료 트랜잭션의 변경 내용을 UNDO로 되돌린다.

- **로그**: 이전 값 기록
- **UNDO**: 필요 / **REDO**: 불필요
- **단점**: 체크포인트를 자주 찍어야 성능 확보 가능
- **채택**: SQL Server (일부), PostgreSQL (잠금 기반)

### 4. REDO 기반 회복 (REDO Logging)

변경 **이후 값(After Image)** 을 로그에 기록한다. 장애 후 재시작 시 커밋된 트랜잭션을 처음부터 재실행한다.

- **로그**: 이후 값 기록
- **UNDO**: 불필요 / **REDO**: 필요
- **단점**: 재실행 비용, 체크포인트 필수
- **채택**: MySQL InnoDB (일부), PostgreSQL

### 5. UNDO/REDO 기반 회복 (ARIES)

이전 값과 이후 값을 **모두** 로그에 기록한다. 미완료 트랜잭션은 UNDO로 취소하고, 커밋된 트랜잭션은 REDO로 재실행한다. 현재 가장 널리 쓰이는 방식이다.

- **로그**: 이전 값 + 이후 값 모두
- **UNDO**: 필요(미완료 TT) / **REDO**: 필요(커밋된 TT)
- **단점**: 구현 복잡, 로그 관리 비용
- **채택**: Oracle, DB2, SQL Server, PostgreSQL, MySQL InnoDB

### 6. 그림자 페이지 기법 (Shadow Paging)

원본 페이지를 그림자(Shadow)로 별도 유지하고, 변경은 사본에만 반영한다. 장애 시 그림자 페이지로 복원한다.

- **로그**: 불필요
- **UNDO**: 없음(원본 복원) / **REDO**: 없음
- **단점**: 동시성 극히 낮음, 대규모 환경에 비효율
- **채택**: Berkeley DB(일부), 학술 시스템

### 7. 체크포인트 회복 (Checkpointing)

단독 기법이라기보다 위 기법들과 함께 쓰이는 최적화다. 주기적으로 체크포인트를 기록해 재시작 시 스캔해야 할 로그 범위를 줄인다.

- **로그**: WAL + 체크포인트 로그
- **UNDO/REDO**: 기반 기법에 따라 결정
- **채택**: 거의 모든 현대 DBMS

---

### 기법 비교 요약표

| 기법 | 로그 필요 | UNDO | REDO | 동시성 | 현대 채택 |
|------|-----------|------|------|--------|-----------|
| 즉시 갱신 | UNDO 로그 | O | X | 보통 | 낮음 |
| 지연 갱신 | UNDO 로그 | X | X | 낮음 | 낮음 |
| UNDO 기반 | 이전 값 | O | X | 보통 | 제한적 |
| REDO 기반 | 이후 값 | X | O | 보통 | 제한적 |
| **ARIES** | **이전+이후 값** | **O** | **O** | **높음** | **표준** |
| 그림자 페이지 | 불필요 | X | X | 낮음 | 거의 없음 |

---

## 장애 유형별 회복 전략

| 장애 유형 | 설명 | 권장 전략 |
|-----------|------|-----------|
| 트랜잭션 장애(Soft Crash) | 단일 트랜잭션 실패 | UNDO 기반 롤백, ARIES Undo 단계 |
| 시스템 장애(Hard Crash) | 전원 차단, OS 크래시 | ARIES 3단계 + 체크포인트 |
| 미디어 장애(Disk Crash) | 디스크 손상 | 백업 + 아카이브 로그 재생, Shadow Paging |
| 네트워크 장애 | 분산 환경 단절 | 원격 백업(Remote Backup), Replica 전환 |

---

## ARIES — 현대 DBMS의 표준 회복 알고리즘

**Algorithm for Recovery and Isolation Exploiting Semantics**

1992년 IBM Research의 C. Mohan 등이 발표한 알고리즘이다. PostgreSQL, MySQL InnoDB, SQL Server, DB2 등 거의 모든 현대 RDBMS가 ARIES 또는 그 변형을 채택하고 있다.

![ARIES 핵심 개념과 3단계 회복 과정](/assets/posts/data/database-recovery-techniques/ARIES.png)

### ARIES의 세 가지 원칙

| 원칙 | 설명 |
|------|------|
| **WAL (Write-Ahead Logging)** | 데이터 페이지보다 로그를 반드시 먼저 디스크에 기록 |
| **Repeating History** | 재시작 시 장애 직전 상태를 완전히 재현 (미완료 TT 포함) |
| **Logging Changes During Undo** | UNDO 작업 자체도 CLR로 로그에 기록 |

### Steal / No-Force 정책

ARIES가 높은 동시성을 확보할 수 있는 이유는 **Steal + No-Force** 정책 때문이다.

| 정책 | 의미 | ARIES |
|------|------|-------|
| **Steal** | 커밋 전에도 dirty page를 디스크에 쓸 수 있음 | O (채택) |
| **No-Steal** | 커밋 전까지 dirty page를 디스크에 쓰지 않음 | X |
| **Force** | 커밋 시 모든 변경을 즉시 디스크에 강제 기록 | X |
| **No-Force** | 커밋 후에도 디스크 기록을 즉시 강제하지 않음 | O (채택) |

Steal 덕분에 버퍼 풀이 자유롭게 관리되고, No-Force 덕분에 커밋 지연이 없다. 대신 장애 시 REDO와 UNDO가 모두 필요하며, 이를 정밀하게 처리하는 것이 ARIES의 역할이다.

---

### ARIES 핵심 자료구조

**로그 레코드 구조**

```
┌─────┬──────────┬────────┬────────┬─────────────┬────────────┬─────────┐
│ LSN │ TransID  │  Type  │ PageID │ Before(이전) │ After(이후) │ PrevLSN │
└─────┴──────────┴────────┴────────┴─────────────┴────────────┴─────────┘
```

- **LSN (Log Sequence Number)**: 단조 증가하는 고유 번호. 로그 순서와 페이지 갱신 여부 판단에 사용
- **Type**: `UPDATE` / `INSERT` / `DELETE` / `CLR` / `COMMIT` / `ABORT`
- **PrevLSN**: 같은 트랜잭션의 이전 로그 포인터 (UNDO 체인 역추적에 사용)
- **CLR (Compensation Log Record)**: UNDO 작업을 기록하는 특수 레코드. 재장애 시 동일 UNDO 중복 방지

**Dirty Page Table (DPT)**

버퍼 풀에 있지만 아직 디스크에 쓰이지 않은 페이지 목록. 각 엔트리에 `RecLSN`(해당 페이지가 처음 더티해진 LSN)을 기록한다.

```
DPT
┌────────┬─────────┐
│ PageID │ RecLSN  │
├────────┼─────────┤
│  P-3   │   100   │
│  P-7   │   103   │
│  P-9   │   101   │
└────────┴─────────┘
```

**Transaction Table (TT)**

장애 직전 활성 상태이던 트랜잭션 목록. `LastLSN`(해당 트랜잭션의 마지막 로그 LSN)을 기록한다.

---

### ARIES 3단계 회복 과정

```
장애 발생 → 재시작
        │
        ▼
① Analysis Phase (분석 단계)
   마지막 체크포인트부터 로그 끝까지 스캔
   → DPT, TT 재구성
   → Redo 시작 LSN 결정
        │
        ▼
② Redo Phase (재실행 단계)
   DPT의 최소 RecLSN부터 로그 끝까지
   → 완료/미완료 트랜잭션 구분 없이 모두 재실행
   → Page LSN 비교로 이미 반영된 변경 건너뜀
        │
        ▼
③ Undo Phase (복원 단계)
   TT에 남은 미완료 트랜잭션을 역순으로 UNDO
   → 각 UNDO마다 CLR 기록
   → 재장애 시에도 CLR로 중복 UNDO 방지
```

#### ① Analysis Phase

마지막 체크포인트 로그부터 로그 끝(장애 직전)까지 순방향으로 스캔한다.

- 커밋 레코드가 있는 트랜잭션은 TT에서 제거
- UPDATE/INSERT/DELETE를 만나면 DPT에 해당 페이지 추가
- 결과로 **재구성된 DPT와 TT** 확보

이 단계의 핵심은 "어디서부터 Redo를 시작할지" 결정하는 것이다. DPT 내 `RecLSN`의 최솟값이 Redo 시작점이 된다.

#### ② Redo Phase

Redo 시작점(DPT 최소 RecLSN)부터 로그 끝까지 순방향으로 모든 변경을 재실행한다.

```
LogLSN = 100 → 101 → 102 → 103 → ... → 최신 LSN

각 레코드마다:
  if LogLSN <= PageLSN:
      skip  # 이미 디스크에 반영됨
  else:
      redo  # 재실행
```

**Repeating History 원칙** — 커밋 여부와 관계없이 모든 변경을 재실행해 장애 직전 상태를 완벽히 재현한다. 이후 Undo 단계에서 미완료 트랜잭션만 선택적으로 취소한다.

#### ③ Undo Phase

TT에 남아있는 미완료 트랜잭션을 PrevLSN 체인을 역방향으로 따라가며 UNDO한다.

```
TT에 T1, T3 남음 (미완료)
  T1: LSN 105 → 102 → 100 순으로 UNDO
  T3: LSN 104 → 101 순으로 UNDO

각 UNDO마다 CLR 기록:
  CLR은 "이 변경을 UNDO했다"는 보상 로그
  재장애 발생 시 CLR이 있으면 해당 UNDO 건너뜀
```

CLR 덕분에 ARIES는 **멱등성(idempotent)** 을 가진다. 회복 도중 또 장애가 발생해도 처음부터 다시 돌리면 동일한 결과를 보장한다.

---

### 체크포인트와의 관계

ARIES는 체크포인트를 두 가지로 활용한다.

1. **Fuzzy Checkpoint**: 버퍼 플러시 없이 DPT와 TT 상태만 로그에 기록. 체크포인트 오버헤드 최소화
2. **Analysis 시작점**: 체크포인트 이전 로그는 스캔 불필요 → 회복 시간 단축

```
로그 타임라인:
───────────────────────────────────────────────►
          │                              │
     Checkpoint                       장애 발생
          │
          └── Analysis 스캔 범위 ──────►
```

---

## 정리

데이터베이스 회복 기법은 단순한 롤백에서 시작해 정교한 ARIES까지 발전해 왔다.

| 기법 | 핵심 가치 | 현대적 위치 |
|------|-----------|------------|
| 즉시/지연 갱신 | 개념적 기반 | 교육용 |
| UNDO/REDO 로깅 | 단방향 회복 | 제한적 사용 |
| Shadow Paging | 단순성 | 사실상 퇴역 |
| **ARIES** | **정밀성 + 동시성** | **현대 표준** |

ARIES가 표준이 된 이유는 명확하다.
- **Steal/No-Force** 로 버퍼 관리와 커밋 성능 모두 확보
- **Repeating History** 로 회복 로직을 단순화
- **CLR** 로 회복 중 재장애에도 안전한 멱등성 보장
- **Fuzzy Checkpoint** 로 회복 범위 최소화

장애는 피할 수 없다. 그래서 회복 알고리즘의 정밀함이 DBMS의 신뢰성을 결정한다.

---

> 관련 포스트: [[database-engine|데이터베이스 엔진이란?]] · [[tcp-ip-web-http|TCP/IP, Web, HTTP 개요]]
