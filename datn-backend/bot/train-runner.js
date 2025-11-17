/*
  Train-runner: builds a fresh NlpManager, registers static + dynamic intents,
  ingests `pre_training` collection, trains, saves and writes `model.txt`.
  Usage: node train-runner.js
*/
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

async function main() {
  await mongoose.connect(process.env.MONGOOSE_URI || process.env.MONGOOSE_DB);
  console.log('Connected to DB');

  const { NlpManager } = require('node-nlp');
  const newManager = new NlpManager({ languages: ['vi'] });

  // Register static intents
  const { registerStaticIntents } = require('./langchain.js');
  await registerStaticIntents(newManager);

  // Load dynamic intents
  const more = require('./more.js');
  if (typeof more.loadDynamicIntentsFor === 'function') {
    await more.loadDynamicIntentsFor(newManager);
  } else if (typeof more.loadDynamicIntents === 'function') {
    await more.loadDynamicIntents(newManager);
  }

  // load pre_training
  const pre_training = mongoose.model('pre_training', mongoose.Schema({ class: String, answer: String, question: String }));
  const p = await pre_training.find({});
  const dedupe = require('./dedupe');
  const existingUtterances = (newManager.documents || []).filter(d => d.locale === 'vi').map(d => String(d.utterance || ''));
  for (const v of p) {
    const q = String(v.question || '').trim();
    const cls = String(v.class || '').trim();
    if (!q || !cls) continue;
    if (dedupe.isSimilarToAny(q, existingUtterances, { jaccardThreshold: 0.65, levenshteinThreshold: 0.72 })) continue;
    newManager.addDocument('vi', q, cls);
    existingUtterances.push(q);
    const answers = (newManager.answers && newManager.answers['vi'] && newManager.answers['vi'][cls]) || [];
    if (!dedupe.isSimilarToAny(String(v.answer || ''), answers, { jaccardThreshold: 0.7, levenshteinThreshold: 0.78 })) newManager.addAnswer('vi', cls, String(v.answer || ''));
  }

  console.log('Training model...');
  await newManager.train();
  await newManager.save();
  const ex = newManager.export();
  fs.writeFileSync('./model.txt', ex);
  console.log('Model written to model.txt');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
