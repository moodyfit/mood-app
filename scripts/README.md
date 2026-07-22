# MOODFIT 생성 파이프라인 (GENERATION.md 구현)

fal.ai `flux/schnell` 로 무드 사진을 배치 생성 → `../images/{축}-{번호}.png` → TAGGING.md 파이프라인 입력.

## 준비
```bash
cd scripts
npm install
cp .env.example .env   # FAL_KEY 를 fal.ai 대시보드에서 발급해 채운다
```

## 실행
```bash
# 프롬프트/비용 미리보기 (키 불필요)
npx tsx generate.ts test --dry
npx tsx generate.ts batch-all 15 --dry

# 실제 생성 (FAL_KEY 필요)
npx tsx generate.ts test            # §1 감성 테스트 5장 → images/_test/
npx tsx generate.ts batch soft 15   # soft 축 15장 (번호 이어서)
npx tsx generate.ts batch-all 15    # 6축 × 15 = 90장
# --dev : fal-ai/flux/dev 로 품질 재테스트
```

## 워크플로우 (문서 순서)
1. `test --dry` 로 프롬프트 확인 → FAL_KEY 세팅 → `test` 로 5장 생성.
2. **사람 검수**: 기존 튜닝분(soul_2 배치 #1·#2)과 감성/이질감 비교. 불합격 시 스타일 앵커 조정·재시도(최대 3회). **승인 후에만 배치.**
3. 배치 비용 미리보기(`--dry`) → 승인 → `batch-all 15`.
4. 산출물은 TAGGING.md 로 인계(체험 관문·태깅).

## 로그
- `../images/gen_log.json`: 파일명·프롬프트 전문·모델·변주 메타 (photos.gen_prompt 소스).

## 주의 (§5)
- 스타일 앵커/의상 블록 임의 변경 금지 · 실존/연예인 유사 금지 · 여성/미성년 금지 · 몸 과장 금지 · 로고 노출 금지 · 승인 전 배치 금지.
- flux 엔드포인트는 negative_prompt 미지원 → 몸 과장 방지는 positive(BODY_GUARD)로 반영.
