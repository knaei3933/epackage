import type { UIMessage } from 'ai';
import {
  formatConversationForEmail,
  formatConversationForEmailHtml,
} from '@/lib/chatbot-email';

const maliciousMessage: UIMessage = {
  id: 'message-1',
  role: 'user',
  parts: [{
    type: 'text',
    text: '<img src=x onerror=alert(1)><script>alert(2)</script>"\'&',
  }],
};

describe('chatbot handoff email formatting', () => {
  it('keeps plain-text conversation output readable', () => {
    expect(formatConversationForEmail([maliciousMessage])).toBe(
      'ユーザー: <img src=x onerror=alert(1)><script>alert(2)</script>"\'&'
    );
  });

  it('escapes untrusted conversation content before HTML email insertion', () => {
    expect(formatConversationForEmailHtml([maliciousMessage])).toBe(
      'ユーザー: &lt;img src=x onerror=alert(1)&gt;&lt;script&gt;alert(2)&lt;/script&gt;&quot;&#39;&amp;'
    );
  });
});
