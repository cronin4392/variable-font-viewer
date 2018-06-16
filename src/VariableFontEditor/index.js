import React, { Component } from 'react';
import {Helmet} from 'react-helmet';
import * as opentype from 'opentype.js';
import camelCaseCSS from 'camelcase-css';
import ContentEditable from 'react-contenteditable';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

import VariableSlider from './VariableSlider';
import axesTagsToCssProp from './helpers/axesTagsToCssProp';
import axesTagsToName from './helpers/axesTagsToName';

import code from './code';

const getNameFromAxesTag = tag => axesTagsToName[tag] || tag;

const convertToVariationSettings = (values) => {
  return Object.keys(values).map((value) => {
    return `"${value}" ${values[value]}`
  }).join(", ");
};

const mapVariationsToStyles = (variations) =>
  Object.keys(variations).reduce((obj, value) => {
    const cssProp = axesTagsToCssProp[value];
    obj[cssProp] = getVariationCssValue(value, variations[value]);
    return obj;
  }, {});

const getVariationCssValue = (variation, minValue, maxValue = null) => {
  if (variation === "ital") {
    return maxValue ? `oblique ${(Math.round(minValue * 90))}deg ${(Math.round(maxValue * 90))}deg` : `oblique ${(Math.round(minValue * 90))}deg`;
  }
  if(variation === "wdth") {
    return maxValue ? `${minValue}% ${maxValue}%` : `${minValue}%`;
  }
  return maxValue ? `${minValue} ${maxValue}` : minValue;
}

const camelCaseStyles = (styles) =>
  Object.keys(styles).reduce((obj, key) => {
    obj[camelCaseCSS(key)] = styles[key];
    return  obj;
  }, {});

const loadFont = (path) => {
  return new Promise((resolve, reject) => {
    opentype.load(path, function(err, font) {
      if (err) {
        reject(err);
      } else {
        resolve(font);
      }
    });
  });
}

const numDigits = (x) => {
  return Math.max(Math.floor(Math.log10(Math.abs(x))), 0) + 1;
}

const getSteps = (maxValue) => {
  const digitsCount = numDigits(maxValue);
  if (digitsCount === 1) {
    return 0.1;
  }
  return 1;
}

const getAxesValuesDefaults = (axes) =>
  axes.reduce((obj, { tag, defaultValue }) => {
    obj[tag] = defaultValue;
    return obj;
  }, {});

const renderFontFaceDeclaration = (font, fontFile) => {
  if (!font) {
    return;
  }

  const { names, outlinesFormat, tables } = font;
  const { fvar } = tables;
  const { axes } = fvar;
  const axesStyles = axes.reduce((obj, {tag, minValue, maxValue}) => {
    const cssProp = axesTagsToCssProp[tag];
    obj[cssProp] = getVariationCssValue(tag, minValue, maxValue)
    return obj;
  },{});

  const fontFace = `
    @font-face {
      font-family: "${names.preferredFamily['en'] || names.fontFamily['en']}";
      ${Object.keys(axesStyles).reduce((output, property) => output += `${property}: ${axesStyles[property]}; `, "")};
      src: url("${fontFile}") format("${outlinesFormat}");
    }
  `;

  return (
    <Helmet>
      <style type='text/css' >{`
          ${fontFace}
      `}
      </style>
    </Helmet>
  );
}

class VariableFontEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      text: this.props.text,
      values: []
    };

    loadFont(this.props.fontFile).then((font) => {
      this.setState({
        values: getAxesValuesDefaults(font.tables.fvar.axes),
        font
      });
    });
  }

  handleTextChange(event) {
    this.setState({
      text: event.target.value,
    });
  }

  renderCssCode(fontVariationSettings, styles) {
    return (
      <pre data-type="css" dangerouslySetInnerHTML={{__html: Prism.highlight(code.fontVariationSettings(fontVariationSettings, styles), Prism.languages.css, 'css')}} />
    );
  }

  filterAxes(axes) {
    if (!this.props.axes) {
      return axes;
    }

    return axes.filter(({tag}) => this.props.axes.indexOf(tag) >= 0);
  }

  render() {
    const { font, values } = this.state;
    const { fontFile } = this.props;

    const variableStyles = mapVariationsToStyles(values);
    const fontVariationSettings = convertToVariationSettings(values);

    const styles = {
      ...this.props.styles,
      ...camelCaseStyles(variableStyles),
      fontVariationSettings,
    };


    return (
      <div>
        {renderFontFaceDeclaration(font, fontFile)}
        <div style={styles}>
          <ContentEditable
            html={this.state.text}
            onChange={this.handleTextChange.bind(this)}
          />
        </div>
        <table>
          <tbody>
            {font && this.filterAxes(font.tables.fvar.axes).map(({ tag, minValue, maxValue }) => {
              return (<tr key={tag}>
                <VariableSlider
                  label={getNameFromAxesTag(tag)}
                  min={minValue}
                  max={maxValue}
                  value={this.state.values[tag]}
                  step={getSteps(maxValue)}
                  onChange={(value) => {
                    this.setState({
                      values: {
                        ...this.state.values,
                        [tag]: value
                      }
                    });
                  }}
                />
              </tr>);
            })}
          </tbody>
        </table>
        <div>{ this.renderCssCode(fontVariationSettings, variableStyles) }</div>
      </div>
    );
  }
}

export default VariableFontEditor;
