import enigma from 'enigma.js';
import * as d3 from 'd3';
import BarChart from './barchart';

// The API schema needed for Enigma to connect to Qlik
import qixSchema from '../node_modules/enigma.js/schemas/qix/3.1/schema.json';

// https://github.com/qlik-oss/enigma.js/blob/master/docs/qix/configuration.md
const config = {
    schema: qixSchema,
    appId: 'd7b1f94e-749b-479a-9bad-fcb8fccda5dc', // The document containing our data
    session: {
        host: 'branch.qlik.com',
        prefix: 'anon'
    }
}

// Connect to Qlik's QIX Engine
enigma.getService('qix', config).then(qix => {

    // Create a object containing a definition of a aggregation data subscription
    // http://help.qlik.com/en-US/sense-developer/3.2/Subsystems/EngineAPI/Content/Classes/AppClass/App-class-CreateSessionObject-method.htm
    qix.app.createSessionObject({
        qInfo: {
            qType: 'myobject'
        },
        // http://help.qlik.com/en-US/sense-developer/3.2/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/HyperCubeDef.htm
        qHyperCubeDef: {
            qDimensions: [{
                qDef: {
                    qFieldDefs: ['Priority'] // The dimension or column
                }
            }],
            qMeasures: [{
                qDef: {
                    qDef: 'Count( %CaseId )' // The measure or rows
                },
                qSortBy: {
                    qSortByNumeric: -1, // -1 decs, 1 asc
                }
            }],
            qSuppressMissing: true,
            qSuppressZero: true,
            qInterColumnSortOrder: [1,0], // Sort the resulting data set by measure first, then dimensional values.
            qInitialDataFetch: [{ qTop: 0, qLeft: 0, qWidth: 2, qHeight: 2000 }]
        }
    }).then(model => {

        const element = document.getElementById('chart')
        const chart = new BarChart(element)

        const update = () => model.getLayout().then(layout => {
            chart.setData(layout)
        })

        // When the state of the data has changed, invoke update.
        model.on('changed', update)

        // Initial rendering
        update()

    })

    // Create a object containing a List definition, does not perform aggregations.
    // http://help.qlik.com/en-US/sense-developer/3.2/Subsystems/EngineAPI/Content/GenericObject/PropertyLevel/ListObjectDef.htm
    qix.app.createSessionObject({
        qInfo: {
            qType: 'list'
        },
        qListObjectDef: {
            qDef: {
                qFieldDefs: ['Status']
            },
            qInitialDataFetch: [{ qTop: 0, qLeft: 0, qWidth: 1, qHeight: 100 }]
        }
    }).then(model => {

        const element = document.getElementById('filter')
        const ul = d3.select(element).append('ul');

        const update = () => model.getLayout().then(layout => {

            const li = ul.selectAll('li').data(layout.qListObject.qDataPages[0].qMatrix, (d) => d[0].qElemNumber)
            
            li.enter().append('li')
                .merge(li)
                .text(d => d[0].qText)
                .on('click', (d) => {
                    // Instruct the Engine to filter the data model based on the clicked element. Will trigger a invalidation of state.
                    model.selectListObjectValues('/qListObjectDef', [d[0].qElemNumber], false);
                })
                .attr('class', d => d[0].qState)
        
        })

        // When the state of the data has changed, invoke update.
        model.on('changed', update)

        // Initial rendering
        update()

    })

})