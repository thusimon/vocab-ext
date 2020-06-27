class TranslateAPI {
  constructor() {
    this.API_KEY = '<replace-api-key-later>';
    this.reqUriBase = 'https://translation.googleapis.com/language/translate/v2';
    this.reqUriFreeBase = 'https://translate.googleapis.com/translate_a/single?client=gtx';
  }
  async translate(q, source, target, format) {
    const fetchResp = await fetch(`${this.reqUriBase}?key=${this.API_KEY}`, {
      method: 'POST',
      body: JSON.stringify({
        q,
        target,
        source,
        format
      })
    });
    const dataRaw = await fetchResp.json();
    if (fetchResp.status != 200) {
      throw new Error(dataRaw.error.message);
    }
    const {data: {translations: [{translatedText}]}} = dataRaw;
    return {
      translatedText,
      originalText: q
    };
  }
  async translateFree(q, source, target) {
    const reqUri = `${this.reqUriFreeBase}&sl=${source}&tl=${target}&dt=t&q=${q}`;
    const fetchResp = await fetch(reqUri);
    const dataRaw = await fetchResp.json();
    const [[[translatedText,originalText]]] = dataRaw;
    return {
      translatedText,
      originalText
    };
  }
}