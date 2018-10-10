/*
Contains all the HTML parsing functionality.
*/

/*
Input: HTML string
Output: a model
*/
function parseHTML(html) {
  return parseHTMLRecursive(html, 0, null, 0).result;
}

function parseHTMLRecursive(html, start, outerTag, depth) {
  logVerboseParse('recursive', '..'.repeat(depth), html.substring(start), outerTag);
  let result = [];
  let state = 'text';
  let textBegin = -1;
  let tagNameBegin = -1;
  let attributeNameBegin = -1;
  let attributeNameEnd = -1;
  let attributeValueBegin = -1;
  let attributes = [];
  let tagNameEnd = -1;
  let lastState = 'none';
  let i = start;
  for (; i < html.length; i++) {
    const x = html[i];
    const currentState = state;
    if (state === 'text') {
      if (lastState !== 'text') textBegin = i;
      if (x === '<') {
        state = 'tag name';
        if (textBegin < i) {
          result.push({
            type: 'text',
            start: textBegin,
            end: i,
            content: html.substring(textBegin, i)
          });
        }
      }
    } else if (state === 'tag name') {
      if (lastState !== 'tag name') {
        tagNameBegin = i;
        attributes = [];
      }
      if (x === '>') {
        state = 'inside tag';
        tagNameEnd = i;
      } else if (x === ' ') {
        state = 'attribute name';
        tagNameEnd = i;
      }
    } else if (state === 'attribute name') {
      if (lastState !== 'attribute name') attributeNameBegin = i;
      if (x === '=') {
        state = 'attribute value block';
        attributeNameEnd = i;
      }
    } else if (state === 'attribute value block') {
      if (x === '"') {
        state = 'attribute value';
      }
    } else if (state === 'attribute value') {
      if (lastState !== 'attribute value') attributeValueBegin = i;
      if (x === '"') {
        state = 'more attributes';
        const attributeValueEnd = i;
        const attributeName = html.substring(attributeNameBegin, attributeNameEnd);
        const attributeValue = html.substring(attributeValueBegin, attributeValueEnd);
        attributes.push({
          name: attributeName,
          nameStart: attributeNameBegin,
          nameEnd: attributeNameEnd,
          value: attributeValue,
          valueStart: attributeValueBegin,
          valueEnd: attributeValueEnd
        });
      }
    } else if (state === 'more attributes') {
      if (x === ' ') {
        state = 'attribute name';
      } else if (x === '>') {
        state = 'inside tag';
      }
    } else if (state === 'inside tag') {
      state = 'text';
      const tagName = html.substring(tagNameBegin, tagNameEnd);
      if (outerTag !== null && tagName === '/' + outerTag) {
        break;
      } else {
        const recursiveResult = parseHTMLRecursive(html, i, tagName, depth + 1);
        result.push({
          type: 'tag',
          name: tagName,
          nameStart: tagNameBegin,
          nameEnd: tagNameEnd,
          start: start,
          end: recursiveResult.newPosition,
          children: recursiveResult.result,
          attributes: attributes
        });
        i = recursiveResult.newPosition - 1;
      }
    }
    lastState = currentState;
  }
  const x = {
    newPosition: i,
    result: result
  };
  logVerboseParse('recursive', '..'.repeat(depth), 'returns', JSON.stringify(x));
  return x;
}

function parseCssSelector(css) {
  let result = css.split(',').map((a) => a.trim()).map((selector) => {
    let result = selector
    .split(' ')
    .map((a) => a.trim())
    .filter((a) => a.length > 0)
    .map((selectorToken) => {
      let result = {};
      let x = selectorToken[0];
      if (x === '#') {
        result.type = 'id';
        result.content = selectorToken.substring(1);
      } else if (x === '.') {
        result.type = 'class';
        result.content = selectorToken.substring(1);
      } else {
        result.type = 'tag';
        result.content = selectorToken;
      }
      return result;
    });
    let paddedResult = [];
    for (let i = 0; i < result.length; i++) {
      paddedResult.push(result[i]);
      if (i !== result.length - 1) {
        paddedResult.push({
          type: 'descendant'
        });
      }
    }
    return paddedResult;
  });
  return result;
}

/*
Input: a CSS string
Output: the CSS model
function parseCSS(css) {
  let rules = [];
  let rule = null;
  let selector = null;
  let state = 'before selector';
  let lastState = 'none';
  let i = 0;
  for (; i < css.length; i++) {
    const x = css[i];
    const currentState = state;
    if (state === 'before rule') {
      if (!/\s/.test(x)) { // not whitespace?
        state = 'begin selector group';
        rule = {
          selectors: [],
          declarations: []
        };
      }
    }

    if (state === 'begin selector group') {
      if (x === '.') { // class
        state = 'selector token content';
        currentSelectorToken.type = 'class';
      } else if (x === '#') { // id
        state = 'selector token content';
        currentSelectorToken.type = 'id';
      } else {
        state = 'selector token content';
        currentSelectorToken.type = 'tag';
      }
    } else if (state === 'selector token content') {
      if (x === '.') { // class
        
      } else if (x === ' ') {

      }
    }
  }
}*/

/*
Input: a model and position array
Output: the node referenced by the position, or null if it doesn't exist
*/
function traverseModel(model, position) {
  if (position.length === 0) {
    return null;
  } else {
    // the first position value is a special case
    let currentModel = model[position[0]];

    for (let i = 1; i < position.length; i++) {
      if (currentModel === undefined) {
        return null;
      }
      currentModel = currentModel.children[position[i]];
    }
    return currentModel;
  }
}

/*function logVerboseParse(...args) {
  console.log(...args); // eslint-disable-line no-console
}*/
function logVerboseParse() {
  // do nothing
}

export { parseHTML, traverseModel, parseCssSelector };
