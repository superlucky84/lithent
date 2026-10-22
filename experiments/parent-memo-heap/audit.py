"""Independent audit of V8 flat arrays and the JavaScript analysis."""
import gzip
import hashlib
import json
from pathlib import Path
import sys

out = Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/lithent-c3-heap-20261022')
analysis = json.loads((out / 'analysis.json').read_text())
rows = []
for run in analysis['collection']['runs']:
    if run['kind'] != 'snapshot':
        continue
    for point in run['points']:
        compressed = (out / point['snapshot']['file']).read_bytes()
        assert hashlib.sha256(compressed).hexdigest() == point['snapshot']['gzipSHA256']
        raw = gzip.decompress(compressed)
        assert hashlib.sha256(raw).hexdigest() == point['snapshot']['sha256']
        data = json.loads(raw)
        meta = data['snapshot']['meta']
        nf, ef = meta['node_fields'], meta['edge_fields']
        nodes = [dict(zip(nf, data['nodes'][at:at + len(nf)]))
                 for at in range(0, len(data['nodes']), len(nf))]
        assert len(nodes) == data['snapshot']['node_count']
        cursor = 0
        edges = []
        for node in nodes:
            outgoing = []
            for _ in range(node['edge_count']):
                edge = dict(zip(ef, data['edges'][cursor:cursor + len(ef)]))
                cursor += len(ef)
                edge['type'] = meta['edge_types'][0][edge['type']]
                edge['name'] = str(edge['name_or_index']) if edge['type'] in ('element', 'hidden') else data['strings'][edge['name_or_index']]
                assert edge['to_node'] % len(nf) == 0
                edge['target'] = edge['to_node'] // len(nf)
                outgoing.append(edge)
            edges.append(outgoing)
        assert cursor == len(data['edges'])
        for node in nodes:
            node['type'] = meta['node_types'][0][node['type']]
            node['name'] = data['strings'][node['name']]
        summary = analysis['snapshots'][run['name']][point['label']]
        assert sum(node['self_size'] for node in nodes) == summary['selfBytes']
        templates = {edge['target'] for index, node in enumerate(nodes)
                     if node['name'] == 'system / AllocationSite'
                     for edge in edges[index]
                     if edge['type'] == 'internal' and edge['name'] == 'transition_info'}
        required = dict(componentInfo={'ctor', 'vd', 'up', 'upR', 'umts'},
                        memo={'dependencies', 'version'}, snapshot={'keys', 'deps'},
                        output={'component', 'memo', 'version'}, rowData={'id', 'label'})
        ids = {shape: dict(instances=[], templates=[]) for shape in required}
        for index, node in enumerate(nodes):
            if node['type'] != 'object':
                continue
            keys = {edge['name'] for edge in edges[index] if edge['type'] == 'property'}
            for shape, fields in required.items():
                if fields <= keys:
                    ids[shape]['templates' if index in templates else 'instances'].append(node['id'])
        for shape in required:
            for kind in ('instances', 'templates'):
                assert sorted(ids[shape][kind]) == sorted(summary['shapeIDs'].get(shape, {}).get(kind, []))
        by_id = {node['id']: index for index, node in enumerate(nodes)}
        for weak_map in summary['weakMaps']:
            route = weak_map['path']
            if route:
                for before, after in zip(route, route[1:]):
                    edge = after['edge']
                    assert edge['type'] != 'weak' and 'part of key' not in edge['name'] and 'part of value' not in edge['name'] and 'DevTools console' not in edge['name']
                    assert any(candidate['type'] == edge['type'] and candidate['name'][:180] == edge['name'] and nodes[candidate['target']]['id'] == after['node']['id'] for candidate in edges[by_id[before['node']['id']]])
            table = nodes[by_id[weak_map['table']['id']]]
            assert table['self_size'] == weak_map['table']['selfBytes']
        rows.append(dict(name=run['name'], label=point['label'], nodes=len(nodes), selfBytes=summary['selfBytes'], instances=summary['instances']))
assert len(rows) == 14
tables = {}
for label, summary in analysis['snapshots']['lithent'].items():
    table = next(item for item in summary['weakMaps'] if item['path'] and item['path'][-1].get('edge', {}).get('name') == 'Oe')
    tables[label] = table
    if label != 'live-1000':
        assert all(name in ('native: system / Hole', 'native: system / Map') for name, _ in table['tableTargets'])
assert tables['clear-25']['table']['selfBytes'] - tables['clear-5']['table']['selfBytes'] == 196608
assert len({tables[label]['table']['id'] for label in ('clear-25', 'clear-100', 'clear-300', 'final-clear')}) == 1
result = dict(complete=True, implementation='Python standard library; independent V8 node/edge traversal', snapshots=rows, paths='All recorded ordinary strong WeakMap paths checked against raw edges', outputBackingTableGrowthBytes=196608)
(out / 'audit.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(dict(complete=True, snapshots=len(rows), outputBackingTableGrowthBytes=196608)))
