/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2008-present Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */
package org.sonatype.nexus.distributed.event.service.api.common;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

import static com.google.common.base.Preconditions.checkNotNull;
import static org.sonatype.nexus.distributed.event.service.api.EventType.UPDATED;

/**
 * Indicates that a Data store configuration has been updated.
 *
 * @since 3.next
 */
public class DataStoreConfigurationEvent
    extends DistributedEventSupport
{
  public static final String NAME = "DataStoreConfigurationEvent";

  private final String configurationName;

  private final String type;

  private final String source;

  private final Map<String, String> attributes;

  @JsonCreator
  public DataStoreConfigurationEvent(
      @JsonProperty("configurationName") final String configurationName,
      @JsonProperty("type") final String type,
      @JsonProperty("source") final String source,
      @JsonProperty("attributes") final Map<String, String> attributes)
  {
    super(UPDATED);
    this.configurationName = checkNotNull(configurationName);
    this.type = checkNotNull(type);
    this.source = checkNotNull(source);
    this.attributes = checkNotNull(attributes);
  }

  public String getConfigurationName() {
    return configurationName;
  }

  public String getType() {
    return type;
  }

  public String getSource() {
    return source;
  }

  public Map<String, String> getAttributes() {
    return attributes;
  }

  @Override
  public String toString() {
    return "DataStoreConfigurationEvent{" +
        "name='" + configurationName + '\'' +
        ", type='" + type + '\'' +
        ", source='" + source + '\'' +
        ", attributes=" + attributes +
        '}';
  }
}
