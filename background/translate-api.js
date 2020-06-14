class TranslateAPI {
  constructor() {
    this.API_KEY = '<replace-api-key-later>'
    this.reqUriBase = 'https://translation.googleapis.com/language/translate/v2'
    this.reqUriFreeBase = 'https://translate.googleapis.com/translate_a/single?client=gtx'
  }
  async translate(q, source, target, format) {
    const reqUri = `${this.reqUriBase}?source=${source}&target=${target}&key=${this.API_KEY}&format=${format}&q=${q}`;
    const fetchResp = await fetch(reqUri);
    const dataRaw = await fetchResp.json();
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