/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Open Source Version is distributed with Sencha Ext JS pursuant to a FLOSS Exception agreed upon
 * between Sonatype, Inc. and Sencha Inc. Sencha Ext JS is licensed under GPL v3 and cannot be redistributed as part of a
 * closed source work.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */

import {ListMachineUtils, ValidationUtils} from '@sonatype/nexus-ui-plugin';
import {actions, assign, send} from 'xstate';
import Axios from 'axios';

export default ListMachineUtils.buildListMachine({
  id: 'CleanupPoliciesPreviewListMachine',
  initial: 'loaded',
  sortableFields: ['group', 'name', 'version'],

  config: (config) => ({
    ...config,
    context: {
      ...config.context,
      repository: '',
      policyData: {},
      isAlertShown: false
    },
    states: {
      ...config.states,
      loaded: {
        ...config.states.loaded,
        on: {
          ...config.states.loaded.on,
          FILTER: {
            ...config.states.loaded.on.FILTER,
            actions: [...config.states.loaded.on.FILTER.actions, 'debouncePreview', 'sendPreview']
          },
          RETRY_PREVIEW: {
            actions: ['debouncePreview', 'sendPreview']
          },
          PREVIEW: {
            target: 'loading',
            cond: 'canPreview',
            actions: ['saveRequest']
          }
        }
      },
      loading: {
        ...config.states.loading,
        states: {
          ...config.states.loading.states,
          fetch: {
            ...config.states.loading.states.fetch,
            invoke: {
              ...config.states.loading.states.fetch.invoke,
              onDone: {
                ...config.states.loading.states.fetch.invoke.onDone,
                actions: [...config.states.loading.states.fetch.invoke.onDone.actions, 'maybeShowAlert']
              }
            }
          }
        }
      }
    },
    on: {
      CLEAR_PREVIEW: {
        target: 'loaded',
        actions: ['clear']
      }
    }
  })
}).withConfig({
  actions: {
    setData: assign({
      data: (_, {data}) => data.data.results,
      pristineData: (_, {data}) => data.data.results,
      total: (_, {data}) => data.data.total
    }),

    clear: assign({
      repository: '',
      filter: '',
      data: () => [],
      pristineData: () => [],
      total: () => 0,
      isAlertShown: () => false
    }),

    debouncePreview: actions.cancel('cleanup-preview'),
    sendPreview: send(({repository, policyData}) => ({
      type: 'PREVIEW',
      repository,
      policyData
    }), {
      id: 'cleanup-preview',
      delay: 500
    }),

    maybeShowAlert: assign({
      isAlertShown: (_, {data}) => Boolean(data.data.total)
    }),

    saveRequest: assign({
      repository: (_, {repository}) => repository,
      policyData: (_, {policyData}) => policyData
    })
  },
  guards: {
    canPreview: (_, {repository, policyData}) => ValidationUtils.notBlank(repository) && (
        ValidationUtils.notBlank(policyData.criteriaLastBlobUpdated) ||
        ValidationUtils.notBlank(policyData.criteriaLastDownloaded) ||
        ValidationUtils.notBlank(policyData.criteriaReleaseType) ||
        ValidationUtils.notBlank(policyData.criteriaAssetRegex)
    )
  },
  services: {
    fetchData: ({filter}, {policyData, repository}) => Axios.post(
        '/service/rest/internal/cleanup-policies/preview/components', {
          criteriaLastBlobUpdated: policyData.criteriaLastBlobUpdated,
          criteriaLastDownloaded: policyData.criteriaLastDownloaded,
          criteriaReleaseType: policyData.criteriaReleaseType,
          criteriaAssetRegex: policyData.criteriaAssetRegex,
          filter: filter || '',
          repository
        })
  }
});
