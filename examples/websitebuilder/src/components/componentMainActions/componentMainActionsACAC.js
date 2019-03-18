// @flow

import { type ComponentMainActionsState } from './componentMainActionsState'
import { wsbE } from "../../wsbE"

const { makeSACAC, makeEpicCondition } = wsbE

export const 
    componentMainActionsEpicVat = 'COMPONENT_MAIN_ACTIONS_VAT',
    componentMainActionsEditButtonPress = makeSACAC('COMPONENT_MAIN_ACTIONS_EDIT_PRESSED'),
    componentMainActionsCondition = makeEpicCondition<ComponentMainActionsState>(componentMainActionsEpicVat),
    componentsMainActionsIsVisibleCondition = componentMainActionsCondition.withSelectorKey('visible'),
    componentsMainActionsWhenVisibleCondition = componentMainActionsCondition.withGuard<ComponentMainActionsState>(s => s.visible),
    componentsMainActionsPositionWhenVisibleCondition = componentsMainActionsWhenVisibleCondition.wsk('position'),
    componentsMainActionsDimensionsWhenVisibleCondition = componentsMainActionsWhenVisibleCondition.wsk('dimensions'),
    // $FlowFixMe
    componentsMainActionsPositionWhenVisiblePassiveCondition = componentsMainActionsPositionWhenVisibleCondition.toPassive(),
    // $FlowFixMe
    componentsMainActionsDimensionsWhenVisiblePassiveCondition = componentsMainActionsDimensionsWhenVisibleCondition.toPassive()