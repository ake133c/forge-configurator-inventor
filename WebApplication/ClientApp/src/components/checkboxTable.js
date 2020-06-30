import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Column } from 'react-base-table';
import BaseTable, { AutoResizer, FrozenDirection } from 'react-base-table';
import CheckboxTableHeader from './checkboxTableHeader';
import CheckboxTableRow from './checkboxTableRow';
import { checkedProjects } from '../reducers/mainReducer';
import { setCheckedProjects, clearCheckedProjects } from '../actions/uiFlagsActions';
import { cloneArray } from 'react-base-table/lib/utils';

import styled from 'styled-components';

const CHECK_COLUMN = 'check_column';
const Icon = ({ iconname }) => (
  <div>
    <img src={iconname} alt='' width='16px' height='18px' />
  </div>
);

const iconRenderer = ({ cellData: iconname }) => <Icon iconname={iconname} />;

const cellBackgroundColor = 'white';
const cellHoverColor = '#f3f3f3';

const Cell = styled.div`
  background-color: ${cellBackgroundColor};
`;

const Row = styled.div`
  [id=checkbox_hover_visible] {
    display:none;
  }

  &:hover {
    [id=checkbox_hover_visible] {
      display:block;
    }
  }
`;

const HeaderRow = styled.div`
  display: flex;
  background-color: ${cellBackgroundColor};
  width: inherit;
  height: calc(100% - 1px); // this keeps header underlined

  [id=checkbox_hover_visible] {
    display:none;
  }

  &:hover {
    background-color: ${cellHoverColor};

    [id=checkbox_hover_visible] {
      display:block;
    }
  }  
`;

export class CheckboxTable extends Component {

    constructor(props) {
      super(props);

      this.projectListColumns = [
        {
          width: 78,
          flexShrink: 0,
          locked: true,
          resizable: false,
          frozen: FrozenDirection.RIGHT,
          align: Column.Alignment.RIGHT,
          position: 1 - Number.MAX_VALUE,
          headerRenderer: () => (
            <CheckboxTableHeader
              onChange={(clearAll) => {this.onSelectAllChange(clearAll); }}
              selectable={this.props.selectable}
            />
          ),
          cellRenderer: ({ rowData }) => (
            <CheckboxTableRow
              rowData={rowData}
              onChange={(checked, rowData) => {this.onSelectChange(checked, rowData); }}
              selectable={this.props.selectable}
            />
            ),
          key: CHECK_COLUMN
        },
        {
            key: 'icon',
            title: '',
            dataKey: 'icon',
            cellRenderer: iconRenderer,
            align: Column.Alignment.RIGHT,
            width: 32
        },
        {
            key: 'label',
            title: 'Package',
            dataKey: 'label',
            align: Column.Alignment.LEFT,
            width: 200
        }
      ];
    }

    onSelectAllChange(clearAll) {
      if (clearAll) {
        this.props.clearCheckedProjects();
      } else {
        const projects = this.props.projectList.projects ? this.props.projectList.projects.map(project => project.id) : [];
        this.props.setCheckedProjects(projects);
      }
    }

    onSelectChange(checked, rowData) {
      const projects = cloneArray(this.props.checkedProjects);
      const id = rowData.id;
      const index = projects.indexOf(id);

      if (checked) {
        if (index === -1) {
          projects.push(id);
        }
      } else {
        if (index > -1) {
          projects.splice(index, 1);
        }
      }
      this.props.setCheckedProjects(projects);
    }

    render() {
      let data = [];
      if(this.props.projectList && this.props.projectList.projects) {
        data = this.props.projectList.projects.map((project) => (
          {
            id: project.id,
            icon: 'Archive.svg',
            label: project.label,
          }
        ));
      }

      return (
        <AutoResizer>
          {({ width, height }) => {
                return <BaseTable
                  width={width}
                  height={height}
                  columns={this.projectListColumns}
                  data={data}
                  rowEventHandlers={{
                    onClick: ({ rowData }) => {
                      this.props.onProjectClick(rowData.id);
                    }
                  }}
                  cellProps = {({ columnIndex }) =>
                    columnIndex === 0 && {
                      tagName: Cell,
                      onClick: e => {
                        // stop click on the first cell (checkbox) and do not select project
                        e.preventDefault();
                        e.stopPropagation();
                      }
                  }}
                  rowProps = {{
                    tagName: Row // styled div to show/hide row checkbox when hover
                  }}
                  headerRenderer={ ({ cells }) => {
                    // get prepared the first checkbox cell and override
                    // background color to be consistent with row checkbox cells
                    const headerCheckboxCell = cells[0];
                    const updatedCell = React.cloneElement(headerCheckboxCell, {
                      style: { ...headerCheckboxCell.props.style, backgroundColor: cellBackgroundColor }
                    });

                    cells.shift(); // remove original item

                    // HeaderRow - styled row with hovering enabled - render checkbox cell + rest of columns
                    return (<HeaderRow id="checkbox_hover_visible">{updatedCell}{cells}</HeaderRow>);
                  }}
              />;
          }}
        </AutoResizer>
        );
    }
  }

/* istanbul ignore next */
export default connect(function (store) {
  return {
    projectList: store.projectList,
    checkedProjects: checkedProjects(store)
  };
}, { setCheckedProjects, clearCheckedProjects })(CheckboxTable);