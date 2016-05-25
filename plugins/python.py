import symtable
import json
import sys

code = open(sys.argv[1]).read()
tb = symtable.symtable(code, '<string>', 'exec')

entities = []
def visit(table):
    for table in table.get_children():
        line = table.get_lineno()
        entity = {
            'type': table.get_type(),
            'name': table.get_name(),
            'loc': {
                'start': {
                    'line': line,
                    'column': 0
                },
                'end': {
                    'line': line + 1,
                    'column': 0
                }
            }
        }
        entities.append(entity)
        visit(table)

visit(tb)
print json.dumps(entities)
