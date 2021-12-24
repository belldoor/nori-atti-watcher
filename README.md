# nori-atti-watcher
놀이아띠 장난감 재고 감시 스크립트

# Example
![nori-atti-watcher-example](https://static-image-resource.s3.ap-northeast-2.amazonaws.com/nori_atti_watcher_example.png)

# How to
* [놀이아띠 홈페이지](http://www.nwscc.or.kr/new/raise/dab3.php?pno=03020202)에서 빌리길 원하는 장난감의 링크와 이름을 스크립트에 추가.
* `npn run start`를 통해 스크립트 테스트.
* [apex up](https://github.com/apex/up)을 이용해 해당 NodeJS 스크립트를 [AWS Lambda](https://aws.amazon.com/ko/lambda/) 서비스에 등록.
* [AWS EventBridge (Cloud Watch Events)](https://aws.amazon.com/ko/eventbridge/)를 통해 원하는 주기마다 Lambda 서비스를 호출.
* [Telegram Bot API](https://core.telegram.org/bots/api)를 통해 재고 알림을 받는다.