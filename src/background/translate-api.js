class TranslateAPI {
  constructor() {
    this.API_KEY = 'API-KEY-TO-REPLACE';
    this.reqUriBase = 'https://translation.googleapis.com/language/translate/v2';
    /**
     * query parameters: dt
     * t: translation
     * at: alternative translation
     * rm: transliteration of source and translated texts
     * bd: dictionary, if query is one word
     * md: definitions of source text, if it's one word
     * ss: synonyms of source text, if it's one word
     * ex: example
     * query parameters: dj=1: json format
     */
    this.reqUriFreeBase = 'https://translate.googleapis.com/translate_a/single?client=gtx&dt=t&dt=bd&dt=ex&dt=rm&dt=ss&dj=1';
  }
  shiftLeftOrRightThenSumOrXor(num, opArray) {
    return opArray.reduce((acc, opString) => {
      var op1 = opString[1];	//	'+' | '-' ~ SUM | XOR
      var op2 = opString[0];	//	'+' | '^' ~ SLL | SRL
      var xd = opString[2];	//	[0-9a-f]
  
      var shiftAmount = hexCharAsNumber(xd);
      var mask = (op1 == '+') ? acc >>> shiftAmount : acc << shiftAmount;
      return (op2 == '+') ? (acc + mask & 0xffffffff) : (acc ^ mask);
    }, num);
  }
  
  hexCharAsNumber(xd) {
    return (xd >= 'a') ? xd.charCodeAt(0) - 87 : Number(xd);
  }
  
  transformQuery(query) {
    for (var e = [], f = 0, g = 0; g < query.length; g++) {
      var l = query.charCodeAt(g);
      if (l < 128) {
        e[f++] = l;					//	0{l[6-0]}
      } else if (l < 2048) {
        e[f++] = l >> 6 | 0xC0;		//	110{l[10-6]}
        e[f++] = l & 0x3F | 0x80;	//	10{l[5-0]}
      } else if (0xD800 == (l & 0xFC00) && g + 1 < query.length && 0xDC00 == (query.charCodeAt(g + 1) & 0xFC00)) {
        //	that's pretty rare... (avoid ovf?)
        l = (1 << 16) + ((l & 0x03FF) << 10) + (query.charCodeAt(++g) & 0x03FF);
        e[f++] = l >> 18 | 0xF0;		//	111100{l[9-8*]}
        e[f++] = l >> 12 & 0x3F | 0x80;	//	10{l[7*-2]}
        e[f++] = l & 0x3F | 0x80;		//	10{(l+1)[5-0]}
      } else {
      e[f++] = l >> 12 | 0xE0;		//	1110{l[15-12]}
      e[f++] = l >> 6 & 0x3F | 0x80;	//	10{l[11-6]}
      e[f++] = l & 0x3F | 0x80;		//	10{l[5-0]}
      }
    }
    return e;
  }
  
  normalizeHash(encondindRound2) {
    if (encondindRound2 < 0) {
      encondindRound2 = (encondindRound2 & 0x7fffffff) + 0x80000000;
    }
    return encondindRound2 % 1E6;
  }
  
  calcHash(query, windowTkk) {
    //	STEP 1: spread the the query char codes on a byte-array, 1-3 bytes per char
    var bytesArray = transformQuery(query);
  
    //	STEP 2: starting with TKK index, add the array from last step one-by-one, and do 2 rounds of shift+add/xor
    var d = windowTkk.split('.');
    var tkkIndex = Number(d[0]) || 0;
    var tkkKey = Number(d[1]) || 0;
  
    var encondingRound1 = bytesArray.reduce((acc, current) => {
      acc += current;
      return shiftLeftOrRightThenSumOrXor(acc, ['+-a', '^+6'])
    }, tkkIndex);
  
    //	STEP 3: apply 3 rounds of shift+add/xor and XOR with they TKK key
    var encondingRound2 = shiftLeftOrRightThenSumOrXor(encondingRound1, ['+-3', '^+b', '+-f']) ^ tkkKey;
  
    //	STEP 4: Normalize to 2s complement & format
    var normalizedResult = normalizeHash(encondingRound2);
  
    return normalizedResult.toString() + "." + (normalizedResult ^ tkkIndex)
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
    const reqUri = `${this.reqUriFreeBase}&sl=${source}&tl=${target}&q=${q}`;
    const fetchResp = await fetch(reqUri);
    const dataRaw = await fetchResp.json();
    const {sentences, dict, confidence, synsets, examples} = dataRaw
    const {trans, orig} = sentences[0];
    let translit, src_translit;
    if (sentences[1]) {
      translit = sentences[1].translit;
      src_translit = sentences[1].src_translit;
    }
    let dictResult = [];
    if (dict) {
      dict.forEach(d=>{
        dictResult.push({
          pos:d.pos,
          terms: d.terms
        });
      });
    }
    let exampleRes = [];
    if (examples) {
      exampleRes = examples.example || []
    }
    return {
      translatedText: trans,
      originalText: orig,
      translit,
      src_translit,
      dictResult,
      exampleRes,
      confidence,
      synsets
    };
  }
}