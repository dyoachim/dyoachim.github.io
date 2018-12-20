
evaluatePhrase();

function evaluatePhrase () {
  const wordInput = document.getElementById("wordInput");
  const userText = wordInput.value;
  const wordList = document.getElementById("wordList");

  if (userText) {
    // strip puntuation
    let userTextMoldable = userText.replace(/[.'"?!]/gi, "");
    userTextMoldable = userTextMoldable.replace(/[\n\t][\s]{2,}/gi, " ");
    userTextMoldable = userTextMoldable.toLowerCase();
    // split words
    userTextMoldable = userTextMoldable.split(" ");
    // build reference object
    const wordReference = buildWordReference(userTextMoldable);
    // build sortable array
    const wordArray = buildWordArray(wordReference);
    // index ranking to reference object
    wordArray.forEach(function (word, index) {
      if (wordReference[word.label]) {
        wordReference[word.label].index = index;
      }
    });
    // update display
    const frag = buildWordListFrag(wordArray);
    wordList.innerHTML = "";
    wordList.append(frag);

    drawPieChart(wordArray);
  }
}

function buildWordReference (wordArray) {
  var wordCount = {};
  wordArray.forEach(word => {
    if (wordCount[word]) {
      wordCount[word].count += 1;
    } else {
      wordCount[word] = {
        count: 1,
        label: word
      };
    }
  });
  return wordCount;
}

function buildWordArray (wordReference) {
  var wordArray = [];
  for (let key in wordReference) {
    if (wordReference[key].label) {
      wordArray.push(wordReference[key]);
    }
  }

  wordArray.sort((a, b) => {
    if (b.count === a.count) {
      return a.label.localeCompare(b.label); // alphabetic
    } else {
      return b.count - a.count; // desc
    }
  });

  return wordArray;
}

function buildWordListFrag (wordArray) {
  const frag = document.createDocumentFragment();
  const headers = ["Word", "Count", "Rank"];
  const header = document.createElement("div");

  header.classList.add('word-header');
  headers.forEach(term => {
    let span = document.createElement("span");
    span.innerHTML = term;
    header.append(span);
  });

  frag.append(header);

  wordArray.forEach((word, index) => {
    const div = document.createElement("div");
    const cells = [word.label, word.count, index + 1];
    cells.forEach(cell => {
      let span = document.createElement("span");
      span.innerHTML = cell;
      div.append(span);
    });
    frag.append(div);
  });

  return frag;
}

function drawPieChart (data) {
  const width = 250;
  const height = 250;
  const radius = Math.min(width, height) / 2;

  d3.select('#pie-chart svg').remove();
  const svg = d3.select("#pie-chart")
        .append("svg")
            .attr("width", width)
            .attr("height", height)
        .append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal([
      '#5384D0', '#4CC2DA', '#4EC3A2', '#4CDA70', '#63AD49'
    ]);

    const pie = d3.pie()
        .value(d => d.count);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    const path = svg.selectAll("path")
      .data(pie(data));

    path.enter().append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .attr("stroke", "#424242")
      .attr("stroke-width", "1px")
    .on('mouseover', showTooltip)
    .on('mouseout', resetTooltip);
}

function handleSubmit () {
  setTab('results');
  evaluatePhrase();
}

function resetTooltip () {
  const tooltip = document.getElementById('tooltip');
  tooltip.innerHTML = 'Mouse over to view';
}

function showTooltip (item) {
  const tooltip = document.getElementById('tooltip');
  tooltip.innerHTML = `${item.data.label}: ${item.data.count}`;
}

function setTab  (id) {
  const tabs = document.querySelectorAll('.tab.active');
  const tabLabels = document.querySelectorAll('.tab-label.active');
  const activeTabLabel = document.querySelector(`#${id}`);
  const activeTab = document.querySelector(`#tab-${id}`);

  tabLabels.forEach(tab => tab.classList.remove('active'));
  tabs.forEach(tab => tab.classList.remove('active'));
  
  activeTabLabel.classList.add('active');
  activeTab.classList.add('active');
}


// specs
buildWordReferenceSpec();
buildWordArraySpec();

function buildWordReferenceSpec () {
  const wordArray = ['we', 'can', 'test', 'this', 'test', 'here'];
  const reference = buildWordReference(wordArray)
  const expected = {
    can: { count: 1, label: 'can' },
    here: { count: 1, label: 'here' },
    test: { count: 2, label: 'test' },
    this: { count: 1, label: 'this' },
    we: { count: 1, label: 'we' }
  }

  if (_.isEqual(reference, expected)) {
    console.info('buildWordReference: Passed');
  } else {
    console.error(
      'buildWordReference: Failed',
      JSON.stringify(reference),
      'not equal to',
      JSON.string(expected)
    );
  }
}

function buildWordArraySpec () {
  const wordSplit = ['we', 'can', 'test', 'this', 'test', 'here'];
  const reference = buildWordReference(wordSplit);
  const wordArray = buildWordArray(reference);
  const expected = [
    { count: 2, label: 'test' },
    { count: 1, label: 'can' },
    { count: 1, label: 'here' },
    { count: 1, label: 'this' },
    { count: 1, label: 'we' }
  ];

  if (_.isEqual(wordArray, expected)) {
    console.info('buildWordArray: Passed');
  } else {
    console.error('buildWordArray: Failed', wordArray, 'not equal to', expected);
  }
}
