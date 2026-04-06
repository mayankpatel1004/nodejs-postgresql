import { values } from "lodash";

const resultColumns = await query(queries.getTableData(table_name, filter_string));
      selectedTableRows = resultColumns.rows;
      
    let rows = [{
    item_id: 42,
    site_id: 0,
    item_title: '10',
    item_alias: '10-1769766176',
    item_parent: 0,
    item_type: 'default',
    item_sections_id: '29,31,32',
    item_description: '10',
    attachment1: 'attachment1-1769766176134.png',
    attachment2: null,
    item_shortdescription: '10',
    user_id: 1,
    controller: '11',
    action: '23',
    published_at: 2026-01-29T18:30:00.000Z,
    published_end_at: 2031-01-29T18:30:00.000Z,
    meta_title: '12',
    meta_description: '12',
    created_by: 1,
    created_by_name: 'Developer Account',
    created_by_role: 1,
    display_order: 11,
    display_status: 'Y',
    deleted_status: 'N',
    deleted_by: 0,
    deleted_by_name: null,
    deleted_time: null,
    created_at: 2026-01-30T04:12:29.000Z,
    updated_at: 2026-01-30T04:12:56.000Z
  },
  {
    item_id: 43,
    site_id: 0,
    item_title: 'const query = util.promisify(db.query).bind(db);',
    item_alias: 'const-query-utilpromisifydbquerybinddb-1769766586',
    item_parent: 0,
    item_type: 'default',
    item_sections_id: '24',
    item_description: 'const query = util.promisify(db.query).bind(db);',
    attachment1: null,
    attachment2: null,
    item_shortdescription: 'const query = util.promisify(db.query).bind(db);',
    user_id: 1,
    controller: '',
    action: '',
    published_at: 2026-01-29T18:30:00.000Z,
    published_end_at: 2031-01-29T18:30:00.000Z,
    meta_title: '',
    meta_description: '',
    created_by: 1,
    created_by_name: 'Developer Account',
    created_by_role: 1,
    display_order: 12,
    display_status: 'Y',
    deleted_status: 'N',
    deleted_by: 0,
    deleted_by_name: null,
    deleted_time: null,
    created_at: 2026-01-30T04:19:31.000Z,
    updated_at: 2026-01-30T04:19:46.000Z
  }];


      const resultStructure = await query(queries.getTableStructure(table_name));
      selectedTableStructure = resultStructure.rows;


      <div class="row">
                    {{#if selectedTableRowstructure}}
                      <div class="col-12">
                        <h4 class="card-title mb-3 text-primary pt-3 pl-2">Selected table structure : <small>{{selected_table_name}}</small></h4>
                        <table class="table table-bordered table-striped">
                          <thead>
                            <tr>
                            {{#each selectedTableRowstructure}}
                            <td>{{column_name}}</td>
                            {{/each}}
                          </tr>
                          </thead>
                          <tbody>
                            {{#each selected_table_rows}}
                                <tr>
                                    {{#each this}}
                                        <td>
                                            {{#if this}}
                                                {{this}}
                                            {{else}}
                                                <span class="text-muted">NULL</span>
                                            {{/if}}
                                        </td>
                                    {{/each}}
                                </tr>
                                {{/each}}
                          </tbody>
                        </table>
                      </div>
                    {{/if}}
                  </div>


Please help in display list of records based on thead values