---
title: ACME 프로토콜로 TLS 인증서 자동화하기
date: 2026-05-06
updated: 2026-05-06
tags:
  - acme
  - tls
  - ssl
  - certificate
  - lets-encrypt
  - ca
  - jwks
  - public-key
  - dns
  - automation
  - security
  - http-challenge
  - dns-challenge
  - certificate-renewal
summary: "TLS 인증서 발급과 갱신을 자동화하는 ACME 프로토콜의 동작 원리 — 클라이언트-CA 관계, JWKS 공개키 등록, 도메인 챌린지 방식을 정리한다."
ai_agent: Claude-Code
devto: false
devto_id:
devto_url:
---

# ACME 프로토콜로 TLS 인증서 자동화하기

_written by Claude-Code_

## 배경: Cloudflare에 의존하다 막히다

TLS 인증서 관리는 서비스 운영에서 반드시 해결해야 할 문제다. 인증서가 만료되면 브라우저는 즉시 경고를 표시하고, 사용자는 접속을 포기한다.

Cloudflare를 통해 Let's Encrypt 인증서를 자동 갱신하려는 시도가 있었다. 설정이 간단하고, Cloudflare가 DNS와 인증서를 함께 관리해주기 때문에 이상적으로 보였다. 그러나 약 1주일 동안 DNS 전파 지연, Cloudflare 프록시와 챌린지 검증 충돌, 갱신 훅 미동작 등 다양한 이유로 자동 갱신이 작동하지 않았다.

결론은 단순하다. 외부 서비스에 의존하는 방식은 그 서비스의 제약을 그대로 안고 간다. ACME 프로토콜을 직접 이해하고 다루면, 어떤 환경에서도 인증서 자동화를 구현할 수 있다.

---

## ACME 프로토콜이란

**ACME(Automatic Certificate Management Environment)**는 TLS 인증서의 발급과 갱신을 자동화하는 통신 프로토콜이다. IETF RFC 8555로 표준화되어 있으며, Let's Encrypt가 개발했다.

ACME 이전에는 인증서를 발급받으려면 CA(Certificate Authority, 인증 기관) 웹사이트에 접속해 수동으로 CSR(Certificate Signing Request)을 생성하고, 도메인 소유권을 직접 증명하고, 발급된 인증서 파일을 서버에 수동으로 배포해야 했다. 90일 만료 주기를 사람이 직접 추적해야 했다.

ACME는 이 모든 과정을 API로 정의해 기계가 처리하도록 한다.

---

## 클라이언트와 CA의 관계

ACME에는 두 주체가 있다.

**CA(Certificate Authority)**는 인증서를 서명해 발급하는 기관이다. Let's Encrypt가 대표적이며, ACME API 서버를 운영한다. CA는 발급 전에 반드시 두 가지를 확인한다 — 요청자가 실제 도메인 소유자인가, 그리고 동일한 주체가 지속적으로 갱신을 요청하는가.

**ACME 클라이언트**는 서버에서 실행되는 소프트웨어다. CA의 API에 요청을 보내고, 도메인 소유권 챌린지를 수행하고, 발급된 인증서를 받아 서버에 배포한다. Certbot, acme.sh, Caddy 등이 ACME 클라이언트의 구현체다.

클라이언트와 CA의 관계는 **비대칭 신뢰 구조**다. CA는 클라이언트를 처음에 전혀 신뢰하지 않는다. 클라이언트는 매 요청마다 자신이 누구인지(계정), 그리고 지금 요청하는 도메인이 실제 자신의 것임을 증명해야 한다.

---

## JWKS 공개키와 계정 등록

ACME의 첫 단계는 **계정 생성**이다. 이때 핵심 역할을 하는 것이 JWKS 공개키다.

### 동작 원리

클라이언트는 처음 실행 시 **비대칭 키 쌍**을 생성한다 — 개인키(private key)와 공개키(public key).

공개키는 **JWKS(JSON Web Key Set)** 형식으로 CA에 등록된다. JWKS는 공개키를 JSON으로 표현하는 표준 형식이다.

```json
{
  "kty": "EC",
  "crv": "P-256",
  "x": "f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
  "y": "x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0"
}
```

CA는 이 공개키를 계정 식별자로 사용한다. 이후 클라이언트가 보내는 모든 요청은 개인키로 서명된다. CA는 등록된 공개키로 서명을 검증해 요청이 동일한 계정에서 왔음을 확인한다.

이 방식의 핵심은 **비밀번호가 전혀 없다는 것**이다. 암호가 아닌 암호학적 서명으로 신원을 증명한다. 개인키는 서버 밖으로 절대 나가지 않는다.

---

## 도메인 소유권 챌린지

계정이 등록되면 클라이언트는 인증서 발급 주문(Order)을 제출한다. CA는 즉시 발급하지 않고, 먼저 도메인 소유권을 검증하기 위한 **챌린지(challenge)**를 요구한다.

챌린지 방식은 세 가지가 있다.

### HTTP-01

CA가 무작위 토큰을 제공한다. 클라이언트는 이 토큰을 도메인의 특정 경로에 파일로 배치한다.

```
http://example.com/.well-known/acme-challenge/{token}
```

CA가 이 URL에 HTTP 요청을 보내 토큰을 확인하면 소유권이 검증된다. 구현이 가장 단순하지만, 80번 포트가 열려 있어야 하고 Cloudflare 프록시처럼 요청을 가로채는 레이어가 있으면 실패한다. **Cloudflare 자동 갱신이 실패하는 주요 원인** 중 하나다.

### DNS-01

CA가 제공한 토큰 값을 도메인의 DNS TXT 레코드에 추가한다.

```
_acme-challenge.example.com  TXT  "토큰값"
```

CA가 DNS를 조회해 TXT 레코드를 확인한다. HTTP 포트를 열지 않아도 되고, 와일드카드 인증서(`*.example.com`) 발급이 가능하다. DNS API를 통해 자동화하면 완전한 무인 갱신 구현이 가능하다. 단, DNS 전파에 수십 초에서 수 분이 걸릴 수 있다.

### TLS-ALPN-01

TLS 핸드셰이크 과정에서 특수한 프로토콜 확장(ALPN)을 통해 챌린지를 수행한다. 443 포트만 열려 있어도 되지만, 웹서버 설정이 복잡해 실무에서는 드물게 사용된다.

---

## 전체 자동화 흐름

ACME의 완전한 동작 흐름은 다음과 같다.

```
[1] 계정 생성
    클라이언트 → 키 쌍 생성 → 공개키(JWKS) CA에 등록

[2] 인증서 주문
    클라이언트 → CA에 Order 제출 (대상 도메인 명시)

[3] 챌린지 수행
    CA → 챌린지 제공 (HTTP-01 / DNS-01 / TLS-ALPN-01)
    클라이언트 → 챌린지 배치 → CA에 준비 완료 통보
    CA → 챌린지 검증

[4] 인증서 발급
    클라이언트 → CSR(인증서 서명 요청) 생성 → CA에 제출
    CA → 서명 후 인증서 발급

[5] 자동 갱신
    만료 30일 전 → 클라이언트가 동일 과정 반복
    (계정 재등록 없이, 기존 개인키로 서명해 요청)
```

갱신 시에도 계정을 다시 만들 필요가 없다. 처음에 등록한 공개키가 CA에 남아 있고, 클라이언트는 동일한 개인키로 서명만 하면 된다. Let's Encrypt 인증서의 90일 만료 정책은 의도적인 설계다 — 갱신을 자동화하도록 강제하고, 탈취된 인증서의 유효 기간을 짧게 제한한다.

---

## 정리

ACME는 단순한 자동 갱신 도구가 아니다. **인증서 생애주기 전체를 API로 정의한 프로토콜**이다.

Cloudflare 같은 중간 레이어에 의존하면 그 레이어의 제약이 문제가 된다. ACME 프로토콜을 직접 이해하면 어떤 환경에서도 챌린지 방식을 선택하고 자동화 파이프라인을 구성할 수 있다. DNS-01 챌린지와 DNS API를 조합하면 Cloudflare 없이도, HTTP 포트 없이도 완전 자동화가 가능하다.

---

> 관련 글
> - [[https-ssl-certificate|HTTPS와 SSL 인증서 적용 흐름]]
> - [[cdn-ssl-tls-modes|CDN 서비스의 SSL/TLS 암호화 모드 정리]]
> - [[dns-records|DNS 레코드 정리]]
