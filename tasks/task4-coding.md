# Task 4: Practical Coding Challenge

## Background
The RewardHub platform needs a reliable API endpoint that merchants can use to verify transaction rewards. This endpoint needs to be secure, performant, and maintainable.

## Requirements
Implement the Lambda function in `src/functions/verifyReward.ts` that:

1. Authenticates merchant requests using API keys
2. Accepts transaction IDs and retrieves associated reward information
3. Properly handles errors and edge cases
4. Includes appropriate logging
5. Has at least one unit test

## Specific Requirements
1. The function should validate the API key from the request headers
2. It should extract the transaction ID from query parameters
3. It should verify that the transaction belongs to the authenticated merchant
4. It should return reward details for valid transactions or appropriate error responses
5. Complete at least one of the test cases in `src/tests/verifyReward.test.ts`

## Evaluation Criteria
- **Functionality:** Does the code work as expected?
- **Security:** Are there proper authentication and error handling?
- **Code Quality:** Is the code clean, well-organized, and maintainable?
- **Testing:** Are the critical paths tested?
- **Performance:** Will this solution scale with increased load?
- **Documentation:** Is the code well-documented for other engineers?

## Time
You should spend approximately 40 minutes on this task.

Remember that the mock data services are provided for you - focus on implementing the handler function logic and at least one test case.
