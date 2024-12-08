document.addEventListener('DOMContentLoaded', function () {
    const familyForm = document.getElementById('familyForm');
    const categorySelect = document.getElementById('category');
    const memberInput = document.getElementById('member');
    const submitButton = familyForm.querySelector('button');

    const familyTableBody = document.querySelector('#familyTable tbody');
    const childrenTableBody = document.querySelector('#childrenTable tbody');
    const friendsTableBody = document.querySelector('#friendsTable tbody');
    const totalCountDisplay = document.getElementById('totalCount');
    const familyCountDisplay = document.getElementById('familyCount');
    const childrenCountDisplay = document.getElementById('childrenCount');
    const friendsCountDisplay = document.getElementById('friendsCount');
    const totalPresentCountDisplay = document.getElementById('totalPresentCount');
    const familyPresentCountDisplay = document.getElementById('familyPresentCount');
    const childrenPresentCountDisplay = document.getElementById('childrenPresentCount');
    const friendsPresentCountDisplay = document.getElementById('friendsPresentCount');

    const categories = {
        family: [],
        children: [],
        friends: []
    };

    let editingCategory = '';
    let editingIndex = -1;
    let draggedRow = null;

    // Submissão do formulário
    familyForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const category = categorySelect.value;
        const memberName = memberInput.value.trim();

        if (!category || !memberName) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (editingIndex !== -1) {
            // Editar membro
            categories[editingCategory][editingIndex] = memberName;
            editingIndex = -1;
            editingCategory = '';
            submitButton.textContent = 'Adicionar';
        } else {
            // Adicionar novo membro
            categories[category].push(memberName);
        }

        renderTable(category);
        updateCounts();
        saveToStorage();
        memberInput.value = '';
    });

    // Renderizar tabela
    function renderTable(category) {
        const tableBody = getTableBody(category);
        tableBody.innerHTML = '';

        categories[category].forEach((name, index) => {
            const row = document.createElement('tr');
            row.setAttribute('draggable', 'true');
            row.dataset.index = index;
            row.dataset.category = category;

            // Eventos de Drag and Drop
            row.addEventListener('dragstart', handleDragStart);
            row.addEventListener('dragover', handleDragOver);
            row.addEventListener('dragend', handleDragEnd);
            row.addEventListener('drop', handleDrop);

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${name}</td>
                <td>
                    <input type="checkbox" 
                           data-category="${category}" 
                           data-index="${index}" 
                           ${name.includes('(Presente)') ? 'checked' : ''} />
                </td>
                <td>
                    <button data-category="${category}" data-index="${index}" class="edit edit-btn">Editar</button>
                    <button data-category="${category}" data-index="${index}" class="delete delete-btn">Apagar</button>
                </td>
            `;

            // Adicionar eventos aos botões
            row.querySelector('.edit').addEventListener('click', () => handleEdit(category, index));
            row.querySelector('.delete').addEventListener('click', () => handleDelete(category, index));

            // Evento para checkbox de presença
            row.querySelector('input[type="checkbox"]').addEventListener('change', handlePresenceChange);

            tableBody.appendChild(row);
        });
    }

    // Eventos de presença
    function handlePresenceChange(event) {
        const checkbox = event.target;
        const category = checkbox.dataset.category;
        const memberIndex = checkbox.dataset.index;

        if (checkbox.checked) {
            categories[category][memberIndex] += ' (Presente)';
        } else {
            categories[category][memberIndex] = categories[category][memberIndex].replace(' (Presente)', '');
        }

        renderTable(category);
        updateCounts();
        saveToStorage();
    }

    // Edição de membro
    function handleEdit(category, index) {
        memberInput.value = categories[category][index].replace(' (Presente)', '');
        categorySelect.value = category;
        editingCategory = category;
        editingIndex = index;
        submitButton.textContent = 'Salvar';
    }

    // Exclusão de membro
    function handleDelete(category, index) {
        categories[category].splice(index, 1);
        renderTable(category);
        updateCounts();
        saveToStorage();
    }

    // Funções de Drag and Drop
    function handleDragStart(event) {
        draggedRow = event.target;
        draggedRow.style.opacity = '0.5';
    }

    function handleDragOver(event) {
        event.preventDefault();
        const targetRow = event.target.closest('tr');
        if (targetRow && targetRow !== draggedRow) {
            targetRow.style.border = '2px dashed #000';
        }
    }

    function handleDragEnd() {
        draggedRow.style.opacity = '';
        document.querySelectorAll('tr').forEach(row => (row.style.border = ''));
    }

    function handleDrop(event) {
        event.preventDefault();
        const targetRow = event.target.closest('tr');
        if (draggedRow && targetRow && draggedRow !== targetRow) {
            const sourceIndex = parseInt(draggedRow.dataset.index);
            const targetIndex = parseInt(targetRow.dataset.index);
            const category = draggedRow.dataset.category;

            const [movedMember] = categories[category].splice(sourceIndex, 1);
            categories[category].splice(targetIndex, 0, movedMember);

            renderTable(category);
            saveToStorage();
        }
    }

    // Atualizar contadores
    function updateCounts() {
        const familyCount = categories.family.length;
        const childrenCount = categories.children.length;
        const friendsCount = categories.friends.length;

        const familyPresentCount = categories.family.filter(member => member.includes('(Presente)')).length;
        const childrenPresentCount = categories.children.filter(member => member.includes('(Presente)')).length;
        const friendsPresentCount = categories.friends.filter(member => member.includes('(Presente)')).length;

        const totalCount = familyCount + childrenCount + friendsCount;
        const totalPresentCount = familyPresentCount + childrenPresentCount + friendsPresentCount;

        familyCountDisplay.textContent = familyCount;
        childrenCountDisplay.textContent = childrenCount;
        friendsCountDisplay.textContent = friendsCount;

        familyPresentCountDisplay.textContent = familyPresentCount;
        childrenPresentCountDisplay.textContent = childrenPresentCount;
        friendsPresentCountDisplay.textContent = friendsPresentCount;

        totalCountDisplay.textContent = totalCount;
        totalPresentCountDisplay.textContent = totalPresentCount;
    }

    // Funções de armazenamento
    function saveToStorage() {
        localStorage.setItem('categories', JSON.stringify(categories));
    }

    function loadFromStorage() {
        const storedCategories = JSON.parse(localStorage.getItem('categories')) || {
            family: [],
            children: [],
            friends: []
        };

        Object.keys(storedCategories).forEach(category => {
            categories[category] = storedCategories[category];
            renderTable(category);
        });

        updateCounts();
    }

    // Função utilitária
    function getTableBody(category) {
        if (category === 'family') return familyTableBody;
        if (category === 'children') return childrenTableBody;
        return friendsTableBody;
    }

    loadFromStorage();
});
