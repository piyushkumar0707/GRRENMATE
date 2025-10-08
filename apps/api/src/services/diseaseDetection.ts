import axios from 'axios'

interface DiseaseDetectionResult {
  disease: string | null
  confidence: number
  severity: 'mild' | 'moderate' | 'severe' | null
  diagnosis: string
  symptoms: string[]
  treatment: string
  prevention: string[]
  isHealthy: boolean
}

export class DiseaseDetectionService {
  private openaiApiKey: string

  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY!
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key is required for disease detection')
    }
  }

  async detectDisease(imageUrl: string, plantSpecies?: string): Promise<DiseaseDetectionResult> {
    try {
      const prompt = `You are a professional plant pathologist. Analyze this plant image and provide a detailed health assessment.

${plantSpecies ? `Plant Species: ${plantSpecies}` : ''}

Please analyze the image and provide:
1. Disease/pest identification (if any)
2. Confidence level (0-100)
3. Severity level (mild/moderate/severe)
4. Detailed diagnosis
5. Visible symptoms
6. Treatment recommendations
7. Prevention measures
8. Overall health status

Respond in valid JSON format with this structure:
{
  "disease": "string or null",
  "confidence": number,
  "severity": "mild|moderate|severe|null",
  "diagnosis": "detailed explanation",
  "symptoms": ["symptom1", "symptom2"],
  "treatment": "treatment recommendations",
  "prevention": ["prevention1", "prevention2"],
  "isHealthy": boolean
}`

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const content = response.data.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from OpenAI')
      }

      try {
        const result = JSON.parse(content) as DiseaseDetectionResult
        return {
          ...result,
          confidence: Math.min(100, Math.max(0, result.confidence)) // Ensure 0-100 range
        }
      } catch (parseError) {
        // Fallback if JSON parsing fails
        return {
          disease: null,
          confidence: 50,
          severity: null,
          diagnosis: content,
          symptoms: [],
          treatment: 'Unable to parse detailed recommendations. Please consult a plant expert.',
          prevention: [],
          isHealthy: content.toLowerCase().includes('healthy')
        }
      }
    } catch (error: any) {
      console.error('Disease detection error:', error)
      
      // Return a safe fallback result
      return {
        disease: null,
        confidence: 0,
        severity: null,
        diagnosis: 'Unable to analyze image at this time. Please try again later.',
        symptoms: [],
        treatment: 'Consult a local plant expert or nursery for assistance.',
        prevention: ['Ensure proper watering', 'Maintain good air circulation', 'Monitor plant regularly'],
        isHealthy: true
      }
    }
  }

  async getDiseaseHistory(userId: string): Promise<any[]> {
    // This would integrate with your database to get user's disease detection history
    // For now, returning empty array - you'll implement the database query
    return []
  }

  async saveDiseaseDetection(data: {
    userId: string
    plantId?: string
    imageUrl: string
    result: DiseaseDetectionResult
  }): Promise<any> {
    // This would save to your database using Prisma
    // Implementation depends on your database service integration
    console.log('Saving disease detection:', data)
    return data
  }
}

export const diseaseDetectionService = new DiseaseDetectionService()