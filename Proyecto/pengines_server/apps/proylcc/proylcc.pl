:- module(proylcc,
    [
        put/8
    ]).

:-use_module(library(lists)).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% replace(?X, +XIndex, +Y, +Xs, -XsY)
%
% XsY is the result of replacing the occurrence of X in the XIndex position of Xs with Y.

replace(X, 0, Y, [X|Xs], [Y|Xs]).

replace(X, XIndex, Y, [Xi|Xs], [Xi|XsY]):-
    XIndex > 0,
    XIndexS is XIndex - 1,
    replace(X, XIndexS, Y, Xs, XsY).

%
% satisfaceLinea(+Line,+PLine,-LineSat)
%
% LineSat es 1 si la fila satisface las pistas asociadas, y 0 en caso contrario.

satisfaceLinea(Line,PLine,R) :-
	transformar(Line,Aux),
	satisface(Aux,PLine,R).

%
% satisface(+Pistas,+LPistas,-R)
%
% R es 1 cuando la cantidad de pistas de la linea es igual a la cantidad de pistas que la linea posee, y 0 en caso contrario

satisface([],[0],1).

satisface(Pistas,[0],0) :-
    Pistas \== [].

satisface(Pistas,Pistas,1).

satisface(Pistas,PLine,0) :-
    Pistas \== PLine.

%
% transformar(+Lista,-Pista)
%
% Pista es una lista de enteros, donde cada entero corresponde a la cantidad de # que hay en un subgrupo.
% PE: Lista = [`#`,_,_,´#´], Pista = [1,1]

transformar([],[]).

transformar([X|L],[N|Pista]) :-
	get_consecutivos([X|L],N,LOut),
    N \== 0,
	transformar(LOut,Pista).

transformar([X|L],Pista) :-
	get_consecutivos([X|L],N,LOut),
    N == 0,
	transformar(LOut,Pista).


%
% get_consecutivos(+Lista,-N,-LOut)
%
% Lista es la lista a verificar si tiene consecutivos
% N es el numero de "#" consecutivos en una linea.
% LOut es la lista rstante por recorrer.

get_consecutivos([],0,[]).

get_consecutivos([X|L],0,L) :-
	X \== "#".

get_consecutivos([H|L], M, LAux) :-
    H == "#",
	get_consecutivos(L,N,LAux), 
	M is N + 1.

%
% getColumna(+ColN, +Grilla, +ColAux, -Columna)
%
% ColN es el numero de columna a obtener.
% Grilla es la lista de filas.
% ColAux lista que se va air modificando durante el recorrido.
% Columna es la lista con los elementos pertenecientes a la columna ColN.

getColumna(ColN, Grilla, Columna) :-
    getColumnaAux(ColN, Grilla, [], Columna).

getColumnaAux(_,[],Aux,Aux).

getColumnaAux(ColN, [Fila|Grilla],ColAux,Columna):-
    nth0(ColN, Fila,C),
    append(ColAux,[C],Aux),
    getColumnaAux(ColN,Grilla,Aux,Columna).
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% put(+Contenido, +Pos, +PistasFilas, +PistasColumnas, +Grilla, -GrillaRes, -FilaSat, -ColSat).
%

put(Contenido, [RowN, ColN], PistasFilas, PistasColumnas, Grilla, NewGrilla, FilaSat, ColSat):-
	% NewGrilla es el resultado de reemplazar la fila Row en la posición RowN de Grilla
	% (RowN-ésima fila de Grilla), por una fila nueva NewRow.
	
	nth0(RowN, Grilla, Row),
	nth0(ColN, Row,Cell),

	% NewRow es el resultado de reemplazar la celda Cell en la posición ColN de Row por _,
	% siempre y cuando Cell coincida con Contenido (Cell se instancia en la llamada al replace/5).
	% En caso contrario (;)
	% NewRow es el resultado de reemplazar lo que se que haya (_Cell) en la posición ColN de Row por Conenido.	 
	
	(Cell == Contenido,
    replace(Cell, ColN, _, Row, NewRow)
		;
	replace(_Cell, ColN, Contenido, Row, NewRow)),

	replace(Row, RowN, NewRow, Grilla, NewGrilla),

	%
	nth0(RowN,PistasFilas, PRow),
	satisfaceLinea(NewRow,PRow,FilaSat),
	
	getColumna(ColN, NewGrilla,Columna),
	nth0(ColN,PistasColumnas,PCol),
	satisfaceLinea(Columna,PCol,ColSat).