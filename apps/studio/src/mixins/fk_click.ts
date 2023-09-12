import rawLog from 'electron-log'
import { Tabulator } from 'tabulator-tables';

const log = rawLog.scope('fk_click');

export const FkLinkMixin = {
  methods: {

    // TODO: merge in community, get keyData changes, integrate here
    // check out TableTable first
    fkColumn(column, keyDatas) {
      const keyWidth = 40
      const icon = () => "<i class='material-icons fk-link'>launch</i>"
      const tooltip = () => {
        if (keyDatas.length == 1)
          return `View record in ${keyDatas[0].toTable}`
        else
          return `View records in ${(keyDatas.map(item => item.toTable).join(', ') as string).replace(/, (?![\s\S]*, )/, ', or ')}`
      }
      const clickMenu = [];
      if (keyDatas.length > 1) {
        keyDatas.forEach(x => {
          clickMenu.push({
            label: `<x-menuitem><x-label>${x.toTable}(${x.toColumn})</x-label></x-menuitem>`,
            action: (_e, cell) => {
              this.fkClick(x, _e, cell);
            }
          })
        })
      }

      const fkClick = (e, cell) => this.fkClick(keyDatas[0], e, cell)

      const keyResult = {
        headerSort: false,
        download: false,
        width: keyWidth,
        resizable: false,
        field: column.field + '-link--bks',
        title: "",
        cssClass: "foreign-key-button",
        cellClick: clickMenu.length === 0 ? fkClick : null,
        formatter: icon,
        clickMenu,
        tooltip
      }
      column.cssClass = 'foreign-key'
      return keyResult
    },

    async fkClick(rawKeyData, _e, cell: Tabulator.CellComponent) {
      log.debug('fk click', rawKeyData)
      const fromColumn = cell.getField().replace(/-link--bks$/g, "")
      const valueCell = cell.getRow().getCell(fromColumn)
      const value = valueCell.getValue()

      if (!rawKeyData) {
        log.error("fk-click, couldn't find key data. Please open an issue. fromColumn:", fromColumn)
        this.$noty.error("Unable to open foreign key. See dev console")
      }



      let tableName = rawKeyData.toTable
      let schemaName = rawKeyData.toSchema
      let columnName = rawKeyData.toColumn


      let table = this.$store.state.tables.find(t => {
        return (!schemaName || schemaName === t.schema) && t.name === tableName
      })

      if (tableName && columnName && !schemaName && !table) {
        // might be schema/table instead of table/column, we should check.
        const sn = tableName
        const tn = columnName
        table = this.$store.state.tables.find(t => {
          return t.schema === sn && t.name === tn
        })

        if (table) {
          schemaName = sn
          tableName = tn
          columnName = undefined
        }
      }
      if (!table) {
        this.$noty.error(`Table link: unable to find destination table '${tableName}'`)
        log.error("fk-click: unable to find destination table", tableName)
        return
      }

      if (!columnName) {
        // just assume it's the primary key
        columnName = await this.connection.getPrimaryKey(tableName, schemaName)
      }

      const filter = {
        value,
        type: '=',
        field: columnName
      }
      const payload = {
        table, filter, titleScope: value
      }
      this.$root.$emit('loadTable', payload)
    },

  }
}
