// @flow strict

// epics are aggregates for actions
// if epic is marked as eventSourcingAggregate all actions that it is has conditions to are going to be tracked and persisted

// epics should expose plugins api that will enable defining custom properties for makeEpic
// makeEpic({ pluginsConfig: { eventSourcingDatabase: { aggregate: true } } })
// makeStore({ plugins: { eventSourcingDatabase }}})
const eventSourcingDatabase = makeEpicsPlugin(({
    subscribeOnAction,
    onConditionChanged,
    injectUpdaters,
    epics,
    dispatch,
    dispatchBatchActionsIntoEpic,
    getState,
    injectCustomEpicValidations
}) => {
    const 
        epicAggregates = [],
        conditionsUsedByEpicAggregates = []

    // if epic is aggregate and it has scope, throw error, as it can not have scope. It should only compute state.

    subscribeOnAction(action => {
        if (action.type === 'ESDB_PERSIST') {
            // persist all actions and aggregate states 
        }
    })

    onConditionChanged(({ condition, action }) => {
        // remember all actions that has changed conditions for epicAggregates
    })

    injectUpdaters((epic) => {
        if (epic.pluginCondig.eventSourcingDatabase.aggregate) {
            return updatersToInject
        }
        return []
    })

    storage.fetchAggregates(aggregatesStates => {
        aggregatesStates.forEach(aggregateState => {
            if (aggregateState.version !== aggregate.version) {
                storage.fetchActionsForAggregate(aggregate.requiredActionTypes, (actions) => {
                    dispatchBatchActionsIntoEpic(actions)
                })
            }
        })
        dispatch({ type: 'REHYDRADE_EPIC_AGGREGATES_STATE', epicStatesMap: { 'epicVat': data.epicVat }}
    }))
})