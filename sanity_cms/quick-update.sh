#!/bin/bash

# 使用 sanity CLI 直接執行 GROQ mutation
sanity documents query --api-version 2024-01-01 '*[_type == "homePage"][0] {
  _id,
  _rev,
  "serviceSection": mainSections[_key == "bc86c0c4fe4f"][0]
}' | jq -r '.[0]._id'
