import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader } from 'lucide-react';
import { getDashboard, simulateRetrieval } from '../api/client';
import { formatNumber } from '../utils/helpers';

export default function VengAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Storage Assistant. You can ask me questions regarding current warehouse conditions, batch weight loss, and storage health.',
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dbData, setDbData] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  // Load dashboard data on open to ensure we have live parameters
  const loadData = async () => {
    try {
      const res = await getDashboard();
      if (res && res.data) {
        setDbData(res.data);
      }
    } catch (e) {
      console.error('Assistant failed to load dashboard context:', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userText, time: new Date() }]);
    setInput('');
    setLoading(true);

    // Simulate thinking delay
    setTimeout(async () => {
      let botResponse = '';
      const textLower = userText.toLowerCase();

      try {
        // Fetch fresh context
        const res = await getDashboard();
        const data = res?.data || dbData;
        const { sensor, prediction, batch, alerts } = data || {};

        if (textLower.includes('safe') || textLower.includes('condition') || textLower.includes('status')) {
          if (!sensor) {
            botResponse = 'I cannot retrieve sensor data right now. Please make sure the backend is active.';
          } else {
            const hasAlerts = alerts && alerts.length > 0;
            const statusLabel = prediction?.health_score >= 80 ? 'Optimal' : prediction?.health_score >= 60 ? 'Fair' : 'Critical';
            botResponse = `Currently, the storage conditions are **${statusLabel}** (Health Score: **${prediction?.health_score || 'N/A'}%**). \n\n` +
              `• **Temperature:** ${sensor.temperature}°C (Optimal: 25-30°C)\n` +
              `• **Humidity:** ${sensor.humidity}% (Optimal: 60-70%)\n` +
              `• **Gas Level:** ${formatNumber(sensor.gas_value, 0)} ppm (Optimal: <400 ppm)\n\n` +
              (hasAlerts 
                ? `⚠️ Note: There are currently **${alerts.length}** active alert(s) in the system.`
                : '✅ All storage conditions are within safe ranges.');
          }
        } 
        
        else if (textLower.includes('why') || textLower.includes('decrease') || textLower.includes('health')) {
          if (!prediction) {
            botResponse = 'No predictions are loaded yet. Please verify that an active storage batch is configured.';
          } else {
            const factors = [];
            if (sensor?.temperature > 30) factors.push(`high indoor temperature (${sensor.temperature}°C)`);
            if (sensor?.humidity > 75) factors.push(`elevated storage humidity (${sensor.humidity}%)`);
            if (sensor?.gas_value > 400) factors.push(`increased gas emissions (${formatNumber(sensor.gas_value, 0)} ppm)`);
            if (batch?.storage_days > 45) factors.push(`extended storage duration (${batch.storage_days} days)`);

            botResponse = `The current storage health score is **${prediction.health_score}%**. \n\n` +
              (factors.length > 0 
                ? `The risk factors impacting quality are: \n` + factors.map(f => `- ${f}`).join('\n')
                : `Conditions are stable. The health is primarily maintained by low rotting risks (**${prediction.rot_risk}%**) and adequate ventilation.`);
          }
        } 
        
        else if (textLower.includes('store') || textLower.includes('30 days') || textLower.includes('simulation') || textLower.includes('forecast')) {
          if (!batch?.batch_id) {
            botResponse = 'Simulation is unavailable because there is no active onion storage batch.';
          } else {
            botResponse = 'Analyzing simulation parameters and calculating model projections...';
            setMessages(prev => [...prev, { sender: 'bot', text: botResponse, time: new Date() }]);
            
            try {
              const simRes = await simulateRetrieval(batch.batch_id, 30);
              const sim = simRes.data;
              botResponse = `📋 **30-Day Storage Projection** for batch **${batch.batch_id}**:\n\n` +
                `• **Expected Quality:** ${sim.expected_quality || 'Good'}\n` +
                `• **Predicted Health Score:** ${sim.health_score}%\n` +
                `• **Expected Weight Loss:** ${sim.weight_loss_percentage}% (${sim.weight_loss} kg)\n` +
                `• **Rot Risk:** ${sim.rot_risk}%\n` +
                `• **Sprouting Risk:** ${sim.sprouting_risk}%\n` +
                `• **Spoilage Risk:** ${sim.spoilage_risk}%\n\n` +
                `👉 *Recommendation:* ${sim.recommendation}`;
            } catch (simErr) {
              botResponse = `Simulation request failed. After 30 days, onion storage health score is expected to be ~${Math.max(10, (prediction?.health_score || 85) - 8)}% with weight loss of ~3.6%.`;
            }
            setMessages(prev => prev.slice(0, -1));
          }
        } 
        
        else if (textLower.includes('weight') || textLower.includes('loss')) {
          if (!prediction) {
            botResponse = 'I cannot access active batch weight statistics.';
          } else {
            botResponse = `Current active batch weight metrics:\n` +
              `• **Initial Weight:** ${batch?.initial_weight || '—'} kg\n` +
              `• **Estimated Current Weight:** ${prediction.estimated_current_weight} kg\n` +
              `• **Predicted Weight Loss:** ${prediction.weight_loss_percentage}% (loss of ${prediction.weight_loss} kg).\n\n` +
              `Moisture release occurs through natural transpiration influenced by storage humidity and airflow.`;
          }
        } 
        
        else if (textLower.includes('rot') || textLower.includes('sprouting') || textLower.includes('spoilage') || textLower.includes('risk')) {
          if (!prediction) {
            botResponse = 'Prediction models are currently offline.';
          } else {
            botResponse = `Current risk assessment breakdown:\n` +
              `• **Rotting Risk:** ${prediction.rot_risk}% (humidity & temp correlation)\n` +
              `• **Sprouting Risk:** ${prediction.sprouting_risk}% (shelf duration factor)\n` +
              `• **Spoilage Risk:** ${prediction.spoilage_risk}% (MQ-135 gas correlation)`;
          }
        } 
        
        else {
          botResponse = `I can answer storage queries from the live telemetry system. You can ask:\n\n` +
            `1. *"Is my onion storage condition safe?"*\n` +
            `2. *"Why did the health score decrease?"*\n` +
            `3. *"Can I store the onions for another 30 days?"*\n` +
            `4. *"What is causing the weight loss?"*\n` +
            `5. *"What is the current rot risk?"*`;
        }
      } catch (err) {
        botResponse = 'I had trouble connecting to the backend database. Please check if the server is running.';
      }

      setMessages(prev => [...prev, { sender: 'bot', text: botResponse, time: new Date() }]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
          title="Open Storage Assistant"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[500px] bg-white border border-slate-200 rounded-xl flex flex-col shadow-2xl animate-fade-in text-slate-900 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
                <Bot size={17} className="text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Storage Assistant</h3>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" /> Telemetry Connected
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            >
              <X size={17} />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2.5 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs ${
                  m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'
                }`}>
                  {m.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                </div>
                <div className={`rounded-xl p-3 text-xs leading-relaxed ${
                  m.sender === 'user' 
                    ? 'bg-slate-900 text-white rounded-tr-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-line shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5 max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                  <Bot size={12} />
                </div>
                <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none p-3 text-xs text-slate-500 flex items-center gap-2 shadow-sm">
                  <Loader size={12} className="animate-spin" />
                  Retrieving storage trends...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2">
            <input
              type="text"
              className="input py-2 text-xs flex-1"
              placeholder="Ask about temperature, rot risk, 30 days..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button 
              type="submit" 
              className="btn-primary p-2 w-9 h-9 rounded-md flex items-center justify-center"
              disabled={!input.trim() || loading}
            >
              <Send size={13} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
