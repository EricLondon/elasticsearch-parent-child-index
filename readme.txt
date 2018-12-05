# setup
nvm use
npm install

# start ES
docker-compose build && docker-compose up

# create index for nested
curl -XPUT 'http://localhost:9200/parent-child/' -d '
{
  "mappings": {
    "person": {},
    "assessment": {
      "_parent": {
        "type": "person"
      }
    }
  }
}'

# populate documents
node main.js

# query combined people/assessments, sort on assessment values
curl -XPOST 'http://localhost:9200/same-document/person/_search?pretty' -d '{
  "sort": [
    {
      "assessment_count": "desc",
      "assessments.rank": "desc"
    }
  ]
}'

# queries...

# query nested documents directly
curl -XGET 'http://localhost:9200/parent-child/assessment/_search?pretty'
curl -XGET 'http://localhost:9200/parent-child/person/_search?pretty'

# todo...

# find people with assessments
curl -XPOST 'http://localhost:9200/parent-child/person/_search' -d '{
        "query": {
                "has_child": {
                        "type": "assessment",
                        "inner_hits": {},
                        "query": {
                                "match_all": {}
                        }
                }

        },
        "sort": [
                {
                        "id": "asc"
                }
        ]
}' 2>/dev/null | jq '.hits.hits[0]'
{
  "_index": "parent-child",
  "_type": "person",
  "_id": "2",
  "_score": null,
  "_source": {
    "id": 2,
    "name": "Ted Crooks"
  },
  "sort": [
    2
  ],
  "inner_hits": {
    "assessment": {
      "hits": {
        "total": 3,
        "max_score": 1,
        "hits": [
          {
            "_index": "parent-child",
            "_type": "assessment",
            "_id": "1",
            "_score": 1,
            "_routing": "2",
            "_parent": "2",
            "_source": {
              "id": 1,
              "name": "Licensed Cotton Keyboard",
              "rank": 78,
              "person_id": 2
            }
          },
          {
            "_index": "parent-child",
            "_type": "assessment",
            "_id": "2",
            "_score": 1,
            "_routing": "2",
            "_parent": "2",
            "_source": {
              "id": 2,
              "name": "Awesome Fresh Soap",
              "rank": 28,
              "person_id": 2
            }
          },
          {
            "_index": "parent-child",
            "_type": "assessment",
            "_id": "3",
            "_score": 1,
            "_routing": "2",
            "_parent": "2",
            "_source": {
              "id": 3,
              "name": "Awesome Wooden Table",
              "rank": 72,
              "person_id": 2
            }
          }
        ]
      }
    }
  }
}
