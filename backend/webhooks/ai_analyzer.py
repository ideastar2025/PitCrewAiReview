# apps/webhooks/ai_analyzer.py
import anthropic
from django.conf import settings

def analyze_pr_with_ai(pr_data, diff_content):
    """Analyze PR using Anthropic Claude"""
    
    client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    
    prompt = f"""Analyze this pull request and provide a structured review.

PR Title: {pr_data.get('title')}
PR Description: {pr_data.get('description', 'No description')}

Code Changes:
{diff_content[:5000]}  # Limit to 5000 chars

Provide analysis in this JSON format:
{{
  "summary": "Brief overview",
  "riskScore": 0-100,
  "issues": [
    {{
      "severity": "high|medium|low",
      "title": "Issue title",
      "file": "file path",
      "line": line_number,
      "suggestion": "How to fix"
    }}
  ],
  "recommendations": ["rec 1", "rec 2"],
  "blockers": ["blocker 1"],
  "deploymentReady": true/false
}}

Focus on security, performance, and best practices."""
    
    try:
        message = client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )
        
        content = message.content[0].text
        return parse_ai_response(content)
        
    except Exception as e:
        print(f"AI analysis error: {e}")
        return {
            'summary': 'AI analysis unavailable',
            'riskScore': 50,
            'issues': [],
            'recommendations': [],
            'blockers': [],
            'deploymentReady': False
        }

def parse_ai_response(text):
    """Parse AI response into JSON"""
    import json
    
    try:
        # Remove markdown code blocks if present
        clean_text = text.replace('```json', '').replace('```', '').strip()
        return json.loads(clean_text)
    except:
        return {
            'summary': text[:500],
            'riskScore': 50,
            'issues': [],
            'recommendations': [],
            'blockers': [],
            'deploymentReady': False
        }