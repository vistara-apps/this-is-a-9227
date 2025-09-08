import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

if (!apiKey) {
  throw new Error('Missing OpenAI API key')
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
})

/**
 * Analyze audio snippet to identify potential samples
 * @param {string} audioDescription - Description of the audio or metadata
 * @param {string} songTitle - Optional song title if known
 * @param {string} artist - Optional artist name if known
 * @returns {Promise<Object>} Sample identification results
 */
export const identifySample = async (audioDescription, songTitle = '', artist = '') => {
  try {
    const prompt = `
You are a music sample identification expert. Based on the following information, help identify potential music samples and their original sources.

Audio Description: ${audioDescription}
${songTitle ? `Song Title: ${songTitle}` : ''}
${artist ? `Artist: ${artist}` : ''}

Please provide:
1. Most likely original song(s) that might contain this sample
2. Original artist(s)
3. Potential rights holders (record labels, publishers)
4. Confidence level (1-10)
5. Additional notes or alternative possibilities

Format your response as JSON with the following structure:
{
  "matches": [
    {
      "originalSong": "Song Title",
      "originalArtist": "Artist Name",
      "album": "Album Name",
      "year": "Release Year",
      "rightsHolders": ["Label/Publisher 1", "Label/Publisher 2"],
      "confidence": 8,
      "notes": "Additional context or reasoning"
    }
  ],
  "suggestions": "Any additional suggestions or notes"
}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert music historian and sample identification specialist with deep knowledge of music samples, rights holders, and the music industry.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const result = response.choices[0].message.content
    
    try {
      return JSON.parse(result)
    } catch (parseError) {
      // If JSON parsing fails, return a structured response
      return {
        matches: [{
          originalSong: 'Unknown',
          originalArtist: 'Unknown',
          album: 'Unknown',
          year: 'Unknown',
          rightsHolders: ['Unknown'],
          confidence: 1,
          notes: result
        }],
        suggestions: 'Unable to parse AI response as JSON'
      }
    }
  } catch (error) {
    console.error('Error identifying sample:', error)
    throw new Error('Failed to identify sample. Please try again.')
  }
}

/**
 * Generate a clearance request letter
 * @param {Object} sampleInfo - Information about the sample
 * @param {Object} userInfo - Information about the requesting user
 * @returns {Promise<string>} Generated clearance request letter
 */
export const generateClearanceRequest = async (sampleInfo, userInfo) => {
  try {
    const prompt = `
Generate a professional music sample clearance request letter with the following details:

Sample Information:
- Original Song: ${sampleInfo.originalSong}
- Original Artist: ${sampleInfo.originalArtist}
- Rights Holder: ${sampleInfo.rightsHolder}
- Sample Duration: ${sampleInfo.duration || 'Not specified'}
- Usage Context: ${sampleInfo.usageContext || 'Music production'}

Requesting Party:
- Name: ${userInfo.name || 'Music Producer'}
- Email: ${userInfo.email}
- Project: ${sampleInfo.projectName || 'New Music Project'}

Please create a professional, respectful letter that:
1. Clearly identifies the sample being requested
2. Explains the intended use
3. Requests permission and licensing terms
4. Provides contact information
5. Maintains a professional tone

Format as a business letter.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional music industry legal assistant specializing in sample clearance requests. Write clear, professional, and legally appropriate correspondence.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    })

    return response.choices[0].message.content
  } catch (error) {
    console.error('Error generating clearance request:', error)
    throw new Error('Failed to generate clearance request. Please try again.')
  }
}

/**
 * Analyze contract terms and provide insights
 * @param {string} contractText - The contract or terms text
 * @returns {Promise<Object>} Contract analysis
 */
export const analyzeContract = async (contractText) => {
  try {
    const prompt = `
Analyze the following music sample clearance contract or terms and provide insights:

Contract Text:
${contractText}

Please provide:
1. Key terms summary
2. Financial obligations
3. Usage restrictions
4. Duration/territory limitations
5. Potential red flags or concerns
6. Overall assessment (favorable/unfavorable/neutral)

Format as JSON:
{
  "summary": "Brief overview",
  "financialTerms": "Cost breakdown",
  "restrictions": ["restriction 1", "restriction 2"],
  "duration": "Time limitations",
  "territory": "Geographic limitations",
  "concerns": ["concern 1", "concern 2"],
  "assessment": "favorable/unfavorable/neutral",
  "recommendations": "Suggested actions"
}
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a music industry legal expert specializing in sample clearance contracts. Provide clear, actionable analysis while noting that this is not legal advice.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 1000
    })

    const result = response.choices[0].message.content
    
    try {
      return JSON.parse(result)
    } catch (parseError) {
      return {
        summary: result,
        financialTerms: 'Unable to parse',
        restrictions: [],
        duration: 'Unknown',
        territory: 'Unknown',
        concerns: [],
        assessment: 'neutral',
        recommendations: 'Please review manually'
      }
    }
  } catch (error) {
    console.error('Error analyzing contract:', error)
    throw new Error('Failed to analyze contract. Please try again.')
  }
}
