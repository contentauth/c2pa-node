---
'c2pa-node': patch
---

fixes issue where we leave unsettled promises in the rust layer, which caused unhandled promise rejections in the js layer
