---
title: Elasticsearch란 무엇인가
date: 2026-06-03
updated: 2026-06-03
tags:
  - elasticsearch
  - search-engine
  - inverted-index
  - elk-stack
  - full-text-search
  - distributed-system
  - nosql
  - kibana
  - logstash
  - database
  - backend
  - vector-search
summary: "역색인 구조부터 분산 아키텍처, 실무 활용처까지 — Elasticsearch가 왜 빠르고 어디에 쓰이는지 WHY-WHAT-HOW-WHERE 구조로 정리한다."
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# Elasticsearch란 무엇인가

_written by Claude-Code_

샤이니가 2026년 6월 1일, 새 앨범 *Atmos*로 컴백했다. MK 덕분에 샤이니 플레이리스트를 듣던 중 Ring Ding Dong에서 이 부분이 귀에 꽂혔다.

> *so elastic~ elastic elastic elastic elastic*

Elastic. 검색 엔진이 떠올랐다. Elasticsearch다.

---

## WHY: 기존 DB로 검색이 안 되는 이유

MySQL이나 PostgreSQL로 검색 기능을 구현할 때 흔히 이런 쿼리를 쓴다.

```sql
SELECT * FROM products WHERE name LIKE '%스니커즈%';
```

이 쿼리는 테이블 전체를 처음부터 끝까지 읽는다. 데이터가 100만 건이면 100만 건을 다 뒤진다. 풀스캔(Full Table Scan)이다. 데이터가 늘수록 성능이 선형으로 나빠진다.

거기에 더해 RDB 검색에는 구조적인 한계가 있다.

- **오타 허용 불가**: "스니커즈"를 "스니커스"로 치면 결과가 없다
- **유사어 검색 불가**: "운동화"로 검색해도 "스니커즈" 상품이 안 나온다
- **관련도 정렬 불가**: 어떤 결과가 더 연관성이 높은지 판단할 수단이 없다

Elasticsearch는 이 문제를 역색인(Inverted Index) 구조로 정면 돌파한다.

![Elasticsearch 전체 아키텍처와 핵심 기능 개요|697](/assets/posts/cs/elasticsearch-overview.png)

---

## WHAT: 핵심 개념 3가지

### 1. Inverted Index (역색인)

책 뒤에 붙은 색인을 생각하면 된다. 색인은 "특정 단어가 몇 페이지에 나오는지"를 미리 정리한 표다. 책 전체를 읽지 않고도 원하는 단어를 즉시 찾는다.

Elasticsearch의 역색인도 같은 원리다.

```
"사과"   → [doc1, doc5, doc9]
"바나나"  → [doc2, doc5, doc7]
"elastic" → [doc3, doc8]
```

문서를 저장할 때 텍스트를 단어 단위로 쪼개고, "단어 → 문서 번호 목록" 형태로 매핑을 만들어둔다. 검색 시 전체 문서를 뒤지는 게 아니라 이 매핑만 조회한다. 수억 건도 밀리초 단위로 응답할 수 있는 이유다.

### 2. Document / Index

RDB 개념과 1:1로 대응시키면 바로 이해된다.

| Elasticsearch | RDB |
|---|---|
| Document | Row (행) |
| Index | Table (시트) |
| Field | Column (열) |

Document는 JSON 형태로 저장된다.

```json
{
  "id": 1,
  "name": "Air Max 90",
  "category": "스니커즈",
  "price": 159000
}
```

### 3. Cluster / Shard

데이터가 커지면 한 서버에 다 담을 수 없다. Elasticsearch는 처음부터 분산 구조로 설계되어 있다.

- **Cluster**: 여러 서버(Node)가 묶인 전체 시스템. 큰 도서관이다.
- **Shard**: Index를 잘게 나눈 조각. 각 층의 서가에 해당하며 여러 노드에 분산 저장된다.
- **Replica**: Shard의 복사본. 서버 하나가 죽어도 데이터를 잃지 않고, 읽기 부하도 분산시킨다.

수평 확장(Scale-out)이 가능한 것은 Shard 덕분이다. 데이터가 늘면 Shard 수를 늘리고 노드를 추가하면 된다.

---

## HOW: 데이터가 저장되고 검색되는 흐름

![Elasticsearch WHY / WHAT / HOW / WHERE 기술 다이어그램|697](/assets/posts/cs/elasticsearch-infographic.svg)

### 색인 흐름 (저장할 때)

1. **문서 입력** — JSON 형태로 HTTP 요청을 보낸다
2. **텍스트 분석** — Analyzer가 텍스트를 토큰(단어) 단위로 쪼갠다
3. **역색인 생성** — "단어 → 문서" 매핑을 만든다
4. **샤드 저장** — 해당 샤드에 분산 저장된다
5. **검색 가능** — 약 1초 후 검색에 반영된다 (near real-time)

### 검색 흐름 (찾을 때)

1. **검색 요청** — Query DSL로 검색 조건을 명시한다
2. **샤드 분산** — 관련 샤드에 병렬로 검색 요청을 보낸다
3. **역색인 조회** — 각 샤드에서 해당 단어를 매핑 테이블에서 즉시 찾는다
4. **점수 계산** — BM25 알고리즘으로 각 문서의 관련도 점수를 산출한다
5. **결과 반환** — 관련도 높은 순으로 정렬해 반환한다

BM25는 단순 키워드 일치가 아니라 단어 빈도, 문서 길이, 전체 문서 분포를 고려해 점수를 매긴다. 이 점수가 검색 결과의 순위를 결정한다.

---

## WHERE: 어디에 쓰이나

### 전문 검색 (Full-text Search)

상품 검색, 콘텐츠 검색, 자동완성, 오타 교정이 여기에 해당한다. Naver, Coupang, 배달의민족이 검색 엔진으로 Elasticsearch를 쓴다. "스니커스"를 검색해도 "스니커즈"가 나오고, "운동화"로 검색해도 관련 상품이 나오는 것은 역색인과 형태소 분석기 덕분이다.

### 로그 모니터링

서버 로그를 실시간으로 수집·저장하고 장애 원인을 빠르게 추적하는 데 쓴다. Logstash(수집) → Elasticsearch(저장·검색) → Kibana(시각화)로 이어지는 구성을 **ELK Stack**이라고 부른다. 수천만 건의 로그를 시간 순으로 검색하고 대시보드로 시각화하는 것이 실시간으로 가능하다.

### 보안 / SIEM

이상 트래픽 탐지, 위협 이벤트 상관분석에 Elasticsearch를 쓴다. Elastic Security라는 전용 솔루션도 있다. 수억 건의 이벤트 로그에서 특정 IP의 접근 패턴을 뽑거나 공격 시그니처를 찾는 작업이 가능한 것은 역색인 기반의 고속 검색 덕분이다.

### AI / 벡터 검색

텍스트 임베딩 벡터를 저장하고 유사도 기반으로 검색하는 기능을 지원한다. kNN(k-Nearest Neighbors)과 HNSW 인덱스 구조를 활용한다. RAG(Retrieval-Augmented Generation) 파이프라인에서 관련 문서를 검색하는 용도로 많이 쓴다. LLM이 답변을 생성하기 전에 Elasticsearch에서 관련 컨텍스트를 뽑아 넘기는 구조다.

---

## KEY API: 기본 사용법

Elasticsearch는 REST API로 동작한다. HTTP 요청만으로 모든 작업이 가능하다.

### 문서 저장

```http
POST /products/_doc
{
  "name": "Air Max 90",
  "category": "스니커즈",
  "price": 159000
}
```

### 전문 검색

```http
GET /products/_search
{
  "query": {
    "match": {
      "name": "스니커즈"
    }
  }
}
```

### 집계 (Aggregation)

```http
GET /products/_search
{
  "aggs": {
    "by_category": {
      "terms": { "field": "category" }
    }
  }
}
```

집계는 SQL의 `GROUP BY`에 해당한다. 카테고리별 상품 수, 가격대별 분포 같은 통계를 실시간으로 뽑을 수 있다.

---

Elasticsearch는 검색 엔진이지만 그 이상이다. 로그 분석, 보안 모니터링, 벡터 검색까지 활용 범위가 넓다. 공통점은 하나다. **빠르게 찾는 것**. 역색인이라는 단순한 아이디어가 수억 건의 데이터에서도 밀리초 응답을 가능하게 한다.

Ring Ding Dong의 "elastic elastic elastic elastic"이 귀에 달라붙는 것처럼, 역색인은 한번 이해하면 머릿속에 단단히 박힌다.

---

> **관련 글**
> - [[why-backend-architecture-grows-complex|백엔드 아키텍처는 왜 복잡해지는가]]
> - [[rest-restful-api-design-principles|REST와 RESTful API 설계 원칙]]
> - [[tcp-ip-web-http|TCP/IP, HTTP 그리고 웹]]
