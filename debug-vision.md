The intake form is working but vision generation is failing with "Something went wrong" after submit. 

Please check the following and show me what you find:

1. Open `src/lib/ai/generateVision.ts` and show me the full file
2. Open `src/app/api/intake-leads/[id]/generate/route.ts` and show me the full file
3. Check if there is any try/catch that might be silently swallowing the error without logging it

Then add detailed console.error logging at every failure point in both files so we can see exactly what OpenAI is returning. Push to GitHub when done.
