const { BigQuery } = require('@google-cloud/bigquery');
const { VertexAI } = require('@google-cloud/vertexai');

// Initialize Vertex AI (Gemini)
const vertex_ai = new VertexAI({project: process.env.GCP_PROJECT_ID, location: 'us-central1'});
const model = 'gemini-1.5-pro-preview-0409';
const generativeModel = vertex_ai.preview.getGenerativeModel({ model: model });

// Initialize BigQuery
const bigquery = new BigQuery();
const datasetId = 'bridge_ai_data';
const tableId = 'incident_logs';

/**
 * HTTP Cloud Function.
 * Triggered by a POST request containing unstructured multimodal data.
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.processAndStoreIntent = async (req, res) => {
  try {
    const { unstructuredData, inputType } = req.body; // e.g., base64 Image, Voice Transcript, or Text

    if (!unstructuredData) {
      return res.status(400).send('Unstructured data payload is required.');
    }

    // 1. Send unstructured data to Gemini for extraction
    const prompt = `
      Analyze the following unstructured ${inputType} data.
      Extract the following structured fields:
      - Type: (MEDICAL, EMERGENCY, VOICE)
      - Urgency: (CRITICAL, WARNING, LOG)
      - Title: Short summary
      - Location: If mentioned or visible
      - Recommendation: What human or automated action to take next
      - Confidence: (0-100%)
      
      Respond in raw JSON format strictly.
      
      Data: ${unstructuredData}
    `;

    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    };

    const streamingResp = await generativeModel.generateContent(request);
    const geminiResponseText = streamingResp.response.candidates[0].content.parts[0].text;
    
    // Parse Gemini JSON
    const structuredInsight = JSON.parse(geminiResponseText.replace(/```json/g, '').replace(/```/g, ''));
    
    // Add Metadata
    const finalRecord = {
      ...structuredInsight,
      timestamp: new Date().toISOString(),
      source_type: inputType,
      raw_input_snippet: typeof unstructuredData === 'string' ? unstructuredData.substring(0, 50) : 'binary_blob',
    };

    // 2. Load into BigQuery
    await bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert([finalRecord]);

    console.log(`Inserted incident into BigQuery: ${finalRecord.Title}`);

    // 3. Return structured card response to Frontend
    return res.status(200).json(finalRecord);

  } catch (error) {
    console.error('Error processing intent:', error);
    return res.status(500).send({ error: error.message });
  }
};
