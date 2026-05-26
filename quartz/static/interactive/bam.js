(function(){
var BAM_DATA=[
{id:'layered',name:'레이어드',en:'Layered / MVC',lv:'beginner',tag:'입문 추천',
 desc:'가장 기본적인 구조. HTTP 요청이 Controller → Service → Repository 순으로 흐릅니다. 각 레이어는 바로 아래 레이어에만 의존하며 관심사를 명확히 분리합니다.',
 when:'소규모 CRUD API · 빠른 프로토타이핑 · 팀 온보딩 · 사이드 프로젝트',
 pros:['배우기 쉽고 직관적','FastAPI·Spring·Django 등 프레임워크 친화적','초기 개발 속도 빠름'],
 cons:['Service 비대화 (God Service) 위험','도메인 로직이 Service에 뭉침','레이어 간 결합도 높아 테스트 격리 어려움'],
 tree:'src/\n├── controllers/       ← HTTP 요청·응답 처리\n│   ├── user_controller.py\n│   └── order_controller.py\n├── services/          ← 비즈니스 로직\n│   ├── user_service.py\n│   └── order_service.py\n├── repositories/      ← DB 접근 (SQL / ORM)\n│   └── user_repository.py\n├── models/            ← ORM 엔티티 정의\n│   └── user.py\n├── schemas/           ← 요청 / 응답 DTO\n├── middleware/        ← 인증, 로깅, 에러 핸들링\n└── config/            ← 환경변수, DB 설정\nmain.py\nrequirements.txt'},
{id:'clean',name:'클린 아키텍처',en:'Clean Architecture',lv:'intermediate',tag:'중급',
 desc:'Uncle Bob의 설계 원칙. 의존성 방향이 항상 안쪽(Domain)을 향합니다. 도메인이 DB·프레임워크와 완전히 분리되어 순수한 비즈니스 로직을 독립적으로 테스트할 수 있습니다.',
 when:'복잡한 도메인 로직 · 장기 유지보수 · DB 교체 가능성 있는 프로젝트',
 pros:['도메인이 외부와 완전히 독립','Mock 주입으로 테스트 격리 탁월','DB·프레임워크 교체 가능'],
 cons:['보일러플레이트 코드가 많음','팀 학습 곡선 존재','소규모엔 오버엔지니어링 위험'],
 tree:'src/\n├── domain/            ← 순수 비즈니스 규칙 (외부 의존 없음)\n│   ├── entities/      ← User, Order (순수 클래스)\n│   ├── value_objects/ ← Email, Money\n│   ├── repositories/  ← 인터페이스(추상) 정의만\n│   └── services/      ← 도메인 서비스\n│\n├── application/       ← 유스케이스 조율\n│   ├── use_cases/     ← CreateUser, PlaceOrder\n│   └── dtos/          ← 입출력 데이터 구조\n│\n├── infrastructure/    ← 외부 세계 (DB, API, 메시지)\n│   ├── database/      ← SQLAlchemy / JPA 설정\n│   ├── repositories/  ← 레포지토리 실구현체\n│   └── external/      ← 외부 API 클라이언트\n│\n└── interfaces/        ← 진입점\n    ├── api/           ← FastAPI / Express 라우터\n    └── cli/           ← CLI 명령어\nmain.py'},
{id:'hex',name:'헥사고날',en:'Hexagonal (Ports & Adapters)',lv:'intermediate',tag:'중급',
 desc:'핵심 도메인을 Port(인터페이스)로 감싸고 외부 연결은 Adapter가 담당합니다. Driving(입력) / Driven(출력) 어댑터 개념을 명시적으로 분리합니다.',
 when:'진입점이 다양한 경우 (REST + gRPC + CLI) · 외부 의존성 교체가 잦은 서비스',
 pros:['외부 시스템 교체가 용이','Primary/Secondary 어댑터 명확 구분','테스트 격리 탁월'],
 cons:['클린 아키텍처 수준의 복잡도','Port/Adapter 경계 설계 어려움','소규모엔 과함'],
 tree:'src/\n├── core/              ← 육각형 안쪽 (순수 도메인)\n│   ├── domain/\n│   │   ├── models/    ← 순수 엔티티\n│   │   └── services/  ← 도메인 서비스\n│   └── ports/         ← 인터페이스 정의\n│       ├── input/     ← Driving Port (UseCase 인터페이스)\n│       └── output/    ← Driven Port (RepoPort, MsgPort)\n│\n└── adapters/          ← 육각형 바깥 (외부 연결)\n    ├── primary/       ← 앱을 구동하는 쪽 (Driving)\n    │   ├── rest_api/  ← FastAPI / Flask\n    │   └── cli/       ← CLI 진입점\n    └── secondary/     ← 앱이 호출하는 쪽 (Driven)\n        ├── database/  ← PostgreSQL 어댑터\n        └── messaging/ ← Kafka / RabbitMQ 어댑터\nmain.py'},
{id:'modular',name:'모듈러 모놀리스',en:'Modular Monolith',lv:'intermediate',tag:'중급',
 desc:'단일 배포 단위지만 내부를 도메인별 모듈로 엄격히 분리합니다. 각 모듈은 자체 레이어를 갖고 이벤트·인터페이스로만 통신합니다.',
 when:'마이크로서비스 전환을 고려 중인 중간 규모 · 팀이 도메인별로 나뉜 경우',
 pros:['배포 단순 (단일 프로세스)','도메인 경계 명확','마이크로서비스 분리가 쉬워짐'],
 cons:['모듈 간 경계 유지에 팀 규율 필요','공유 DB 문제는 여전히 존재'],
 tree:'src/\n├── modules/\n│   ├── users/             ← 사용자 도메인 모듈\n│   │   ├── domain/\n│   │   ├── application/\n│   │   ├── infrastructure/\n│   │   └── api/           ← 모듈 내부 라우터\n│   │\n│   ├── orders/            ← 주문 도메인 모듈\n│   │   ├── domain/\n│   │   ├── application/\n│   │   ├── infrastructure/\n│   │   └── api/\n│   │\n│   └── payments/          ← 결제 도메인 모듈\n│       ├── domain/\n│       └── ...\n│\n└── shared/                ← 모듈 간 공유 코드\n    ├── events/            ← 도메인 이벤트 정의\n    ├── exceptions/\n    └── utils/\nmain.py'},
{id:'cqrs',name:'CQRS + 이벤트 소싱',en:'CQRS + Event Sourcing',lv:'advanced',tag:'고급',
 desc:'Command(쓰기)와 Query(읽기) 모델을 완전히 분리합니다. 이벤트 소싱은 현재 상태 대신 발생한 이벤트를 저장하며 완전한 감사 이력을 유지합니다.',
 when:'읽기/쓰기 트래픽 불균형 · 감사 로그 필수 · 복잡한 비즈니스 이벤트 처리',
 pros:['읽기/쓰기 독립 최적화','완전한 이력 및 감사 추적','이벤트 재처리로 상태 복원 가능'],
 cons:['복잡도 매우 높음','Eventual Consistency 처리 필수','디버깅·테스트 어려움'],
 tree:'src/\n├── commands/              ← 쓰기 측 (Write Side)\n│   ├── handlers/          ← CreateOrderHandler\n│   ├── models/            ← Aggregate (비즈니스 규칙)\n│   └── events/            ← OrderCreated, PaymentFailed\n│\n├── queries/               ← 읽기 측 (Read Side)\n│   ├── handlers/          ← GetOrderHandler\n│   └── models/            ← 읽기 최적화 뷰 모델\n│\n├── domain/\n│   ├── aggregates/        ← Order, User Aggregate\n│   ├── events/            ← 도메인 이벤트 정의\n│   └── value_objects/\n│\n└── infrastructure/\n    ├── event_store/       ← 이벤트 저장소 (EventStoreDB)\n    ├── write_db/          ← 쓰기용 DB (PostgreSQL)\n    ├── read_db/           ← 읽기용 DB (Redis, Elasticsearch)\n    └── message_bus/       ← Kafka / RabbitMQ\nmain.py'},
{id:'micro',name:'마이크로서비스',en:'Microservices',lv:'advanced',tag:'고급',
 desc:'기능별로 독립 배포 가능한 서비스로 분리합니다. 각 서비스는 자체 DB를 갖고 API Gateway를 통해 노출됩니다.',
 when:'팀이 크고 독립 배포가 필수 · 서비스별 스케일링 필요 · 높은 가용성 요구',
 pros:['서비스별 독립 배포·스케일링','기술 스택 자유도','장애 격리 (Fault Isolation)'],
 cons:['운영 복잡도 급증 (K8s 필수 수준)','분산 트랜잭션 처리 어려움','네트워크 지연 증가'],
 tree:'services/\n├── api-gateway/           ← 단일 진입점 (Kong, Nginx)\n│   └── routes.yaml\n│\n├── user-service/          ← 사용자 서비스\n│   ├── src/               ← 내부는 별도 아키텍처 적용\n│   ├── Dockerfile\n│   └── requirements.txt\n│\n├── order-service/         ← 주문 서비스\n│   ├── src/\n│   └── Dockerfile\n│\n├── payment-service/       ← 결제 서비스\n│   ├── src/\n│   └── Dockerfile\n│\n└── notification-service/  ← 알림 서비스\n    ├── src/\n    └── Dockerfile\n\ndocker-compose.yml         ← 로컬 개발 환경\nk8s/                       ← 쿠버네티스 배포 설정\n├── deployments/\n└── services/'}
];
var BAM_LV={
  beginner:{bg:'rgba(52,152,219,0.12)',cl:'#2980b9'},
  intermediate:{bg:'rgba(243,156,18,0.12)',cl:'#e67e22'},
  advanced:{bg:'rgba(231,76,60,0.12)',cl:'#c0392b'}
};
function bamEsc(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function bamColorTree(tree){
  return tree.split('\n').map(function(line){
    if(!line.trim())return '';
    var ai=line.indexOf('←');
    var main=ai>=0?line.slice(0,ai):line;
    var comment=ai>=0?line.slice(ai):'';
    var bm=main.match(/^([│├└─\s]*)/);
    var pfx=bm?bm[1]:'';
    var rest=main.slice(pfx.length);
    var isDir=rest.trim().endsWith('/');
    var p=pfx?'<span style="opacity:0.45">'+bamEsc(pfx)+'</span>':'';
    var r=rest?'<span style="'+(isDir?'color:var(--secondary);font-weight:500':'')+'">'+bamEsc(rest)+'</span>':'';
    var c=comment?'<span style="opacity:0.55;font-style:italic">'+bamEsc(comment)+'</span>':'';
    return p+r+c;
  }).join('\n');
}
function bamInit(){
  var list=document.getElementById('bam-list');
  var detail=document.getElementById('bam-detail');
  if(!list||!detail)return false;
  if(list.hasChildNodes())return true;
  list.innerHTML='';
  BAM_DATA.forEach(function(p){
    var lv=BAM_LV[p.lv];
    var b=document.createElement('button');
    b.className='bam-pattern-btn';
    b.dataset.bamId=p.id;
    b.innerHTML='<span class="bam-pattern-name">'+p.name+'</span>'
      +'<span class="bam-pattern-en">'+p.en+'</span>'
      +'<span class="bam-pattern-tag" style="background:'+lv.bg+';color:'+lv.cl+'">'+p.tag+'</span>';
    b.addEventListener('click',function(){bamShow(p.id)});
    list.appendChild(b);
  });
  bamShow('layered');
  return true;
}
function bamShow(id){
  var p=BAM_DATA.filter(function(x){return x.id===id})[0];
  if(!p)return;
  document.querySelectorAll('.bam-pattern-btn').forEach(function(b){
    b.classList.toggle('bam-active',b.dataset.bamId===id);
  });
  var lv=BAM_LV[p.lv];
  var detail=document.getElementById('bam-detail');
  if(!detail)return;
  detail.innerHTML=
    '<div class="bam-content-header">'
      +'<span class="bam-content-title">'+p.name+'</span>'
      +'<span class="bam-content-badge" style="background:'+lv.bg+';color:'+lv.cl+'">'+p.tag+'</span>'
    +'</div>'
    +'<div class="bam-content-en">'+p.en+'</div>'
    +'<div class="bam-content-desc">'+p.desc+'</div>'
    +'<div class="bam-when"><span style="font-weight:600">언제 사용?</span>&nbsp;'+p.when+'</div>'
    +'<div class="bam-tree">'+bamColorTree(p.tree)+'</div>'
    +'<div class="bam-pros-cons">'
      +'<div class="bam-pros-cons-box">'
        +'<div class="bam-pros-cons-title" style="color:#27ae60">장점</div>'
        +p.pros.map(function(x){return '<div class="bam-pros-cons-item">• '+x+'</div>'}).join('')
      +'</div>'
      +'<div class="bam-pros-cons-box">'
        +'<div class="bam-pros-cons-title" style="color:#c0392b">단점 / 주의</div>'
        +p.cons.map(function(x){return '<div class="bam-pros-cons-item">• '+x+'</div>'}).join('')
      +'</div>'
    +'</div>';
}
document.addEventListener('nav', function() {
  requestAnimationFrame(bamInit);
});

// Direct page load: elements are above this script, so they exist immediately
if (!bamInit()) {
  // SPA navigation fallback: elements appear after nav fires
  // Use MutationObserver to detect when they arrive in the DOM
  var bamObs = new MutationObserver(function() {
    if (bamInit()) bamObs.disconnect();
  });
  bamObs.observe(document.body, {childList: true, subtree: true});
  setTimeout(function() { bamObs.disconnect(); }, 10000);
}
})();
