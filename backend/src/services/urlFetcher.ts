/**
 * Service for fetching and extracting content from URLs
 */

interface FetchResult {
  title: string;
  content: string;
  url: string;
}

export class UrlFetcher {
  /**
   * Fetch content from a URL
   */
  async fetchUrl(url: string): Promise<FetchResult> {
    try {
      // Validate URL
      let validUrl: URL;
      try {
        validUrl = new URL(url);
      } catch {
        // If URL is not absolute, try to make it absolute
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          validUrl = new URL(`https://${url}`);
        } else {
          throw new Error('Invalid URL format');
        }
      }

      // Fetch the URL
      const response = await fetch(validUrl.toString(), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; DSA-Platform-Bot/1.0)',
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Extract text content from HTML
      const { title, content } = this.extractContent(html);

      return {
        title: title || validUrl.hostname,
        content: content.substring(0, 10000), // Limit to 10k characters
        url: validUrl.toString(),
      };
    } catch (error: any) {
      throw new Error(`Failed to fetch URL: ${error.message}`);
    }
  }

  /**
   * Extract text content from HTML
   */
  private extractContent(html: string): { title: string; content: string } {
    // Simple HTML parsing - extract text from common content tags
    let title = '';
    let content = '';

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      title = this.cleanText(titleMatch[1]);
    }

    // Extract content from common content tags
    const contentTags = ['article', 'main', 'section', 'div', 'p'];
    const contentRegex = new RegExp(
      `<(?:${contentTags.join('|')})[^>]*>([\\s\\S]*?)</(?:${contentTags.join('|')})>`,
      'gi'
    );

    let matches;
    const extractedTexts: string[] = [];

    while ((matches = contentRegex.exec(html)) !== null && extractedTexts.length < 50) {
      const text = this.cleanText(matches[1]);
      if (text.length > 50) {
        // Only include substantial text blocks
        extractedTexts.push(text);
      }
    }

    content = extractedTexts.join('\n\n');

    // Fallback: extract all text if no structured content found
    if (content.length < 100) {
      content = this.cleanText(html);
    }

    return { title, content };
  }

  /**
   * Clean HTML and extract plain text
   */
  private cleanText(html: string): string {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]+>/g, ' ') // Remove HTML tags
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  /**
   * Extract URLs from text
   */
  extractUrls(text: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = text.match(urlRegex);
    return matches || [];
  }
}

export const urlFetcher = new UrlFetcher();

