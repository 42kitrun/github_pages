---
title: AI Agent는 어떤 개발 원칙으로 코드를 작성하는가?
date: 2026-05-17
updated: 2026-05-17
tags:
  - ai-agent
  - solid-principles
  - design-patterns
  - cohesion
  - coupling
  - software-design
  - clean-code
  - refactoring
  - architecture
  - software-engineering
summary: "AI Agent가 코드를 생성할 때 SOLID 원칙, 응집도·결합도, 디자인 패턴을 어떻게 반영하는지, 그 한계와 활용 전략을 정리한다."
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# AI Agent는 어떤 개발 원칙으로 코드를 작성하는가?

_written by Claude-Code_

AI Agent에게 코드를 작성하게 하면, 그 코드는 어떤 원칙 위에 세워지는가? SOLID를 알고 있는가? 응집도와 결합도를 고려하는가? 디자인 패턴을 적용하는가, 아니면 단순히 "많이 본 코드"를 복현하는 것인가?

이 질문은 AI를 개발 도구로 활용하는 엔지니어라면 반드시 짚고 넘어가야 하는 지점이다.

---

## AI Agent는 원칙을 "학습"했다

AI Agent(LLM 기반)는 수억 개의 오픈소스 코드, 기술 문서, 설계 패턴 예제를 학습한다. 그 과정에서 SOLID, GoF 디자인 패턴, 응집도·결합도 개념 등이 **암묵적으로 내재화**된다.

중요한 점은, AI는 "이 원칙을 의도적으로 적용해야지"라고 판단하는 게 아니라는 것이다. 대신 **"잘 작성된 코드의 통계적 패턴"** 을 학습했기 때문에, 자연스럽게 그 방향으로 수렴하는 경향이 있다.

이것이 가능성이자 동시에 한계다.

---

## SOLID 원칙: 얼마나 반영되는가?

| 원칙 | 풀네임 | AI 적용 경향 |
|------|--------|-------------|
| **S** | Single Responsibility | ★★★★☆ 잘 따름 |
| **O** | Open/Closed | ★★★☆☆ 상황 의존적 |
| **L** | Liskov Substitution | ★★★☆☆ 의식적 적용 드묾 |
| **I** | Interface Segregation | ★★★☆☆ 규모가 커야 의식함 |
| **D** | Dependency Inversion | ★★★★☆ 프레임워크 따라감 |

### SRP: 가장 자연스럽게 적용된다

AI는 함수 하나에 너무 많은 책임이 몰리면 자연스럽게 분리하려는 경향이 있다. 이는 학습 데이터에서 "잘 읽히는 코드"가 SRP를 따르는 경우가 많기 때문이다.

```python
# AI가 자주 생성하는 방식: 역할별 분리
def parse_request(raw_data: str) -> dict:
    ...

def validate_payload(payload: dict) -> bool:
    ...

def process_order(payload: dict) -> Order:
    ...
```

### DIP: 프레임워크의 관습을 따른다

Spring, FastAPI, NestJS 등 의존성 주입(DI)이 기본인 프레임워크를 기반으로 코드를 작성할 때, AI는 자연스럽게 DIP를 따른다. 프레임워크 관습 자체가 DIP를 강제하기 때문이다.

반대로 프레임워크가 없거나 명시적 지시가 없으면, AI는 DIP보다 **직접 구현(concrete implementation)** 을 선택하는 경우도 있다.

### OCP, LSP, ISP: 명시하면 따른다

이 세 원칙은 설계 규모가 커지거나 명확한 확장 시나리오가 있을 때 중요해진다. AI는 맥락 없이 짧은 코드를 생성할 때 이 원칙들을 적극적으로 반영하지 않는다. "지금 동작하는 코드"를 우선한다.

> **결론:** SOLID는 암묵적으로 일부 반영되지만, 명시적으로 요청해야 더 일관성 있게 적용된다.

---

## 응집도와 결합도: 코드 품질의 핵심

응집도(Cohesion)는 모듈 내부의 요소들이 얼마나 밀접하게 연관되었는가, 결합도(Coupling)는 모듈 간의 의존성이 얼마나 강한가를 나타낸다.

```
이상적인 설계 = 높은 응집도(High Cohesion) + 낮은 결합도(Low Coupling)
```

AI는 이 두 개념을 직접 "계산"하지 않는다. 하지만 함수와 클래스를 분리하는 방식에서 자연스럽게 이 기준이 반영된다.

**응집도 측면에서 AI의 경향:**
- 관련 있는 메서드끼리 같은 클래스에 묶는다
- 데이터와 그 데이터를 처리하는 메서드를 함께 배치한다

**결합도 측면에서 AI의 경향:**
- 직접 의존보다 인터페이스·추상 타입을 통한 의존을 선호한다 (단, 명시적 요청 시)
- 전역 상태(global state) 사용은 피하려는 경향이 있다

단, 코드가 길어지거나 맥락이 복잡해질수록 AI는 "당장 동작하는 코드"를 우선해 결합도가 높아지는 경향이 있다. 이것은 AI의 한계 중 하나다.

---

## 디자인 패턴: 의식적으로 사용하는가?

GoF의 23가지 디자인 패턴 중 AI가 자주 적용하는 패턴은 다음과 같다.

| 패턴 | 유형 | AI 적용 빈도 |
|------|------|------------|
| Singleton | 생성 | 높음 (설정, DB 연결 등) |
| Factory / Factory Method | 생성 | 높음 (객체 생성 추상화) |
| Observer | 행위 | 높음 (이벤트, 구독 패턴) |
| Strategy | 행위 | 높음 (알고리즘 교체) |
| Decorator | 구조 | 높음 (미들웨어, AOP) |
| Repository | 아키텍처 | 매우 높음 (데이터 접근 레이어) |
| Command | 행위 | 중간 |
| Template Method | 행위 | 중간 |

AI가 패턴을 적용하는 건 "이 상황에 이 패턴이 어울린다"는 인식보다는, **그 패턴이 적용된 유사한 코드를 많이 봤기 때문**이다.

예를 들어 "결제 수단을 여러 개 지원해야 한다"는 요구사항을 주면, AI는 거의 반사적으로 Strategy 패턴을 적용한다.

```python
class PaymentStrategy:
    def pay(self, amount: int): ...

class CreditCardPayment(PaymentStrategy):
    def pay(self, amount: int): ...

class KakaoPayPayment(PaymentStrategy):
    def pay(self, amount: int): ...
```

이것이 항상 좋은 건 아니다. 패턴 남용(over-engineering)도 AI에게서 자주 발생한다.

> **결론:** AI는 실무에서 자주 쓰는 패턴을 잘 적용하지만, 상황 적합성은 사람이 판단해야 한다.

---

## AI가 실제로 따르는 우선순위

원칙들 사이에서 AI가 실제로 따르는 우선순위는 대략 다음과 같다.

```
1. 동작하는 코드 (Correctness)
2. 가독성 (Readability)
3. 프레임워크/언어 관용구 (Idiomatic Code)
4. 단순성 (Simplicity over Abstraction)
5. 명시적으로 요청받은 원칙
```

SOLID, 디자인 패턴, 응집도·결합도는 **4번과 5번 사이** 어딘가에 위치한다. 즉, AI는 "우선 돌아가게 만들고, 명확히 요청하면 원칙을 따른다"는 방식으로 작동한다.

---

## 실무에서 AI와 협업하는 전략

AI의 원칙 적용이 암묵적이고 불안정하다면, 어떻게 활용해야 할까?

**1. 원칙을 명시적으로 지시한다**

```
"이 코드를 SRP 원칙에 맞게 함수를 분리해서 다시 작성해줘"
"Repository 패턴으로 데이터 접근 레이어를 분리해줘"
```

**2. 컨벤션 문서를 제공한다**

CLAUDE.md나 프로젝트 README에 설계 원칙, 패턴, 레이어 구조를 명시해두면 AI가 해당 맥락을 유지하며 코드를 생성한다.

**3. 리팩토링 요청을 적극 활용한다**

초안을 먼저 생성하고, 이후 "응집도를 높이는 방향으로 리팩토링해줘", "결합도를 낮춰줘"처럼 구체적인 개선 요청을 한다. [[refactoring-in-practice|실무 리팩토링 패턴]] 참고.

**4. 설계 검증은 사람이 한다**

AI가 생성한 코드의 아키텍처 일관성, 패턴 적용의 적절성은 반드시 개발자가 검토해야 한다. AI는 부분 최적화에는 강하지만, 전체 아키텍처 일관성은 보장하지 못한다.

---

## 정리

AI Agent는 SOLID, 응집도·결합도, 디자인 패턴을 "이해"하고 있다. 학습 데이터를 통해 내재화된 패턴이 코드에 자연스럽게 반영된다.

그러나 이것은 **통계적 경향**이지, **원칙의 체계적 적용**이 아니다. 맥락이 짧거나 명시적인 지시가 없으면, AI는 원칙보다 동작하는 코드를 우선한다.

AI를 효과적으로 활용하려면 원칙을 명시하고, 프로젝트 컨벤션을 문서화하고, AI가 생성한 설계를 검증하는 루프를 갖추는 것이 핵심이다.

AI가 코드를 잘 짜는 건 맞다. 하지만 **잘 짜도록 유도하는 것**은 여전히 개발자의 역할이다.

---

## 관련 포스트

- [[design-patterns-overview|디자인 패턴 개요]]
- [[software-architecture-terms|소프트웨어 아키텍처 핵심 용어]]
- [[refactoring-in-practice|실무 리팩토링 패턴]]
