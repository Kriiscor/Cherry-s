# ADR-002: Replicate AI Provider & Vision Model Strategy

## Status

Accepted

## Date

2026-09-28

## Context

The application relies on Artificial Intelligence to process meal photos and natural language descriptions, extracting detailed nutritional data (calories, proteins, carbohydrates, fats, ingredients, and portion size estimates). We need an AI provider that offers high-quality vision/multimodal capabilities with low latency and predictable, cost-effective pricing.

## Options Considered

### Option A: Replicate API with Open-Source Vision Models (Chosen)
- **Pros**:
  - Pay-per-second GPU execution model (`$0.000225/sec` on T4 to `$0.0014/sec` on A100).
  - Flexibility to switch between vision models (Llama 3.2 Vision, LLaVA 1.6, MiniCPM-V 2.6) without changing infrastructure code.
  - Extremely cost-effective (~$0.0015 per photo analyzed, i.e., ~$0.135/user/month).
  - Open-source model independence (no direct proprietary vendor lock-in).
- **Cons**:
  - Cold starts on infrequently invoked serverless GPU endpoints (mitigated by selecting warm public models).

### Option B: Direct Proprietary APIs (OpenAI GPT-4o / Google Gemini Vision)
- **Pros**: Zero cold starts, high multimodal reasoning accuracy.
- **Cons**: Per-token pricing can scale faster with high resolution images, dependent on vendor API policies.

## Decision

We select **Replicate API** as our primary AI vision integration layer because:
1. Replicate provides a unified API to run top-tier vision models with serverless execution.
2. The cost model ($0.00045 - $0.00175 per meal analysis) delivers high profitability for scale.
3. Fallback support can easily be implemented to switch models if latency or accuracy requires it.

## Consequences

- The server backend will sanitize image payloads (resize to max 1024x1024 before transmission) to minimize GPU inference duration.
- Prompt outputs will be structured using JSON Schema enforcement to guarantee valid JSON outputs containing food items, grams, calories, and macros.
