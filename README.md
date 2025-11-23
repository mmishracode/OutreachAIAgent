# OutreachAI Agent 🚀

**AI-Powered Lead Discovery & Outreach Automation**

OutreachAI Agent is a modern React application powered by **Google Gemini 2.5 Flash**. It automates the tedious process of finding leads, researching them, and drafting personalized cold outreach emails.

Built for agencies, freelancers, and sales teams who want to scale their outreach without losing the personal touch.

![App Screenshot](https://via.placeholder.com/1200x600?text=OutreachAI+Dashboard+Preview)

## ✨ Key Features

### 🔍 AI Discovery Agent
- **Live Google Search Grounding**: Uses Gemini's search tools to find real, active prospects (Influencers, Agencies, Coaches) in specific niches and locations.
- **Smart Extraction**: A specialized "Refiner" AI parses unstructured search results into clean profiles, extracting Names, Websites, and Emails.
- **Deduplication**: Automatically handles duplicate URLs and verifies sources.

### ✍️ Hyper-Personalized Copywriting
- **Context-Aware Drafting**: Generates email subject lines and bodies based on the specific prospect's business description and your unique value proposition.
- **One-Click Sending**: seamlessly integrates with **Gmail** or your default mail client to launch the drafted email instantly.

### 📊 Lead Management (CRM)
- **Pipeline Tracking**: Track leads through statuses: `New` -> `Drafted` -> `Sent`.
- **CSV Export**: Download your curated list of leads to Excel or other CRMs.
- **Dashboard Analytics**: Visual insights into your outreach performance.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **AI Model**: Google Gemini 2.5 Flash (`@google/genai` SDK)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Build Tool**: Vite (implied by structure)

---

## 🚀 Getting Started

### Prerequisites

You need a **Google Gemini API Key** with access to the `gemini-2.5-flash` model.
Get it here: [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/outreach-ai-agent.git
   cd outreach-ai-agent
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory and add your API key:
   ```env
   REACT_APP_API_KEY=your_gemini_api_key_here
   # OR if using Vite
   VITE_API_KEY=your_gemini_api_key_here
   ```
   *Note: Ensure the application is set up to read `process.env.API_KEY`.*

4. **Run the App**
   ```bash
   npm start
   ```

---

## 📖 Usage Guide

1. **Dashboard**: Check your high-level stats (Total leads, Emails sent).
2. **Discovery Agent**:
   - Go to the **Discovery Agent** tab.
   - Enter a target role (e.g., "Fitness Coach"), Niche, and Location.
   - Click "Launch Search Mission".
   - Review the found leads and click **"Add to Campaign"** for the ones you like.
3. **Leads & Outreach**:
   - Go to **Leads & Outreach**.
   - Select a lead from the list.
   - Click **"Generate First Draft"**. The AI will read the lead's description and write a custom email.
   - Edit the draft if needed.
   - Click **"Send via Gmail"** to open your email client with everything pre-filled.

---

## 🛡️ License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
