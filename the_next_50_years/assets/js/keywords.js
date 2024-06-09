        let csvData = [];
        let sortOrder = {
            section: 'asc',
            person: 'asc',
            topic: 'asc',
            subtopic: 'asc'
        };

        function processCSV(text) {
            const lines = text.trim().split('\n');
            const headers = lines[0].split(',');

            csvData = lines.slice(1).map(line => {
                const row = line.split(',');
                return {
                    section: row[0],
                    person: row[1],
                    topic: row[2],
                    subtopic: row[3]
                };
            });

            updateColumns();
        }

        function updateColumns() {
            const sectionCount = {};
            const personCount = {};
            const topicCount = {};
            const subtopicCount = {};

            csvData.forEach(row => {
                sectionCount[row.section] = (sectionCount[row.section] || 0) + 1;
                personCount[row.person] = (personCount[row.person] || 0) + 1;
                topicCount[row.topic] = (topicCount[row.topic] || 0) + 1;
                subtopicCount[row.subtopic] = (subtopicCount[row.subtopic] || 0) + 1;
            });

            const sectionList = document.getElementById('sectionList');
            const personList = document.getElementById('personList');
            const topicList = document.getElementById('topicList');
            const subtopicList = document.getElementById('subtopicList');

            sectionList.innerHTML = '';
            personList.innerHTML = '';
            topicList.innerHTML = '';
            subtopicList.innerHTML = '';

            appendItems(sectionList, sectionCount, 'section');
            appendItems(personList, personCount, 'person');
            appendItems(topicList, topicCount, 'topic');
            appendItems(subtopicList, subtopicCount, 'subtopic');
        }

        function appendItems(list, countObject, category) {
            const sortedItems = Object.keys(countObject).sort((a, b) => {
                if (sortOrder[category] === 'asc') {
                    return a.localeCompare(b);
                } else {
                    return b.localeCompare(a);
                }
            });

            for (const item of sortedItems) {
                const li = document.createElement('li');
                if (category === 'section') {
                    const a = document.createElement('a');
                    a.href = item;
                    a.textContent = item;
                    li.appendChild(a);
                } else if (category === 'person') {
                    li.textContent = item;
                } else {
                    li.textContent = `${item} (${countObject[item]})`;
                }
                li.style.fontSize = `${Math.min(10 + countObject[item] * 2, 30)}px`; // Adjust font size based on frequency
                li.addEventListener('click', () => highlightAssociations(item, category));
                list.appendChild(li);
            }
        }

        function sortColumn(category) {
            sortOrder[category] = sortOrder[category] === 'asc' ? 'desc' : 'asc';
            updateColumns();
        }

        function highlightAssociations(value, category) {
            const associatedData = csvData.filter(row => row[category] === value);
            const associatedSections = new Set(associatedData.map(row => row.section));
            const associatedPersons = new Set(associatedData.map(row => row.person));
            const associatedTopics = new Set(associatedData.map(row => row.topic));
            const associatedSubtopics = new Set(associatedData.map(row => row.subtopic));

            clearHighlights();
            highlightItems('sectionList', associatedSections);
            highlightItems('personList', associatedPersons);
            highlightItems('topicList', associatedTopics);
            highlightItems('subtopicList', associatedSubtopics);
        }

        function highlightItems(listId, items) {
            const list = document.getElementById(listId).children;
            for (const li of list) {
                const text = li.textContent.split(' (')[0];
                if (items.has(text)) {
                    li.classList.add('highlight');
                }
            }
        }

        function clearHighlights() {
            const lists = document.querySelectorAll('ul');
            lists.forEach(list => {
                for (const li of list.children) {
                    li.classList.remove('highlight');
                }
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            fetch('persons.csv')
                .then(response => response.text())
                .then(data => processCSV(data))
                .catch(error => console.error('Error fetching the CSV file:', error));
        });