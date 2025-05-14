# Task 2: System Design Challenge

## Background
RewardHub needs a new architecture for its rewards processing system. The current implementation processes rewards synchronously during transaction processing, leading to slow response times, occasional duplicates, and potential data loss during outages. A transaction is conceptually equivalent to a bank statement line item (date, status, from account, to account, description, merchant info...).

## Requirements
Design a scalable, reliable system for reward processing that can:
- Handle 100,000+ transactions per day (assume evenly distributed on average, with spikes of 5x during promotions on a 1-min rampup)
- Process rewards asynchronously to keep transaction times fast
- Ensure no duplicate rewards are issued
- Maintain 99.9% availability
- Allow for future data analysis of reward patterns
- Protect sensitive financial data
- Support a simple API for mobile and web clients

## Expected Deliverables
1. A high-level architecture diagram (you can create this using any tool you prefer, even hand-drawn is fine)
2. Brief explanations of:
   - Key AWS services you would use and why
   - How data flows through the system
   - How you would handle failures
   - Security considerations
   - Monitoring approach
3. A short implementation plan explaining how you would roll this out incrementally

## Constraints
- The company is already using AWS
- The development team has 5 engineers with varying experience levels
- The system must comply with financial data protection regulations
- Cost efficiency is important but reliability is the priority

## Time
You should spend approximately 20 minutes on this task.

Remember, we're looking for a pragmatic approach that balances immediate needs with future scalability.
