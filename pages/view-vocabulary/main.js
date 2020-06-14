const tbody = document.getElementById('vocab-tbody');

const createTableRow = (original, vocabularyItem, idx) => {
  const {translation, createdTime} = vocabularyItem;
  const td1 = document.createElement('td');
  const td2 = document.createElement('td');
  const td3 = document.createElement('td');
  const td4 = document.createElement('td');
  td1.textContent = idx;
  td2.textContent = original;
  td3.textContent = translation;
  td4.textContent = new Date(createdTime).toLocaleString('en');
  const tr = document.createElement('tr');
  tr.append(td1);
  tr.append(td2);
  tr.append(td3);
  tr.append(td4);
  tbody.append(tr);
}

chrome.storage.local.get(null, (vocabularies) => {
  let idx = 1;
  for (const original in vocabularies) {
    createTableRow(original, vocabularies[original], idx);
    idx++;
  }
});
